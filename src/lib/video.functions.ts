/**
 * Geração real de vídeo por cena. Cria o job no provedor, consulta o status
 * e só grava o MP4 no storage privado quando o provedor entrega o arquivo.
 * Nenhum resultado é simulado.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AssetRow, ProjectRow, SceneRow } from "@/types";

export interface VideoAssetState {
  assetId: string;
  sceneId: string;
  status: "generating" | "ready" | "error";
  url: string | null;
  error?: string;
  progress?: number;
}

function fail(error: unknown): string {
  return error instanceof Error ? error.message : "Falha inesperada na geração de vídeo.";
}

/** Inicia a geração do clipe de uma cena. */
export const startSceneVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { projectId: string; sceneId: string }) => input)
  .handler(async ({ data, context }): Promise<VideoAssetState> => {
    const [{ data: projectRow }, { data: sceneRow }] = await Promise.all([
      context.supabase.from("projects").select("*").eq("id", data.projectId).maybeSingle(),
      context.supabase.from("scenes").select("*").eq("id", data.sceneId).maybeSingle(),
    ]);
    const project = projectRow as unknown as ProjectRow | null;
    const scene = sceneRow as unknown as SceneRow | null;
    if (!project || !scene) throw new Error("Cena não encontrada.");
    if (!scene.prompt?.trim()) {
      throw new Error("Esta cena ainda não tem prompt visual. Execute a etapa de Prompts.");
    }

    const { createVideoJob, toBase64, VIDEO_MODEL } = await import("./ai/video.server");
    const { BUCKET } = await import("./media.server");

    // Usa a imagem já gerada da cena como primeiro quadro, quando existir.
    let image: { base64: string; mime: string } | undefined;
    const { data: imageAsset } = await context.supabase
      .from("assets")
      .select("*")
      .eq("scene_id", scene.id)
      .eq("type", "image")
      .eq("status", "ready")
      .limit(1)
      .maybeSingle();
    const imageRow = imageAsset as unknown as AssetRow | null;
    if (imageRow?.url) {
      const file = await context.supabase.storage.from(BUCKET).download(imageRow.url);
      if (file.data) {
        const bytes = new Uint8Array(await file.data.arrayBuffer());
        image = {
          base64: toBase64(bytes),
          mime: imageRow.url.endsWith(".jpg") ? "image/jpeg" : "image/png",
        };
      }
    }

    const prompt = image
      ? `${scene.prompt}\n\nAnimate the given image as the first frame in a single continuous shot: ${scene.movement || "slow camera move"}. ${scene.atmosphere}. No dialogue. No on-screen text.`
      : `${scene.prompt}\n\nSingle continuous cinematic shot. ${scene.movement}. ${scene.lighting}. ${scene.atmosphere}. No dialogue. No on-screen text.`;

    const job = await createVideoJob({
      prompt,
      seconds: scene.duration_s,
      aspectRatio: project.config.aspectRatio,
      resolution: "720p",
      ...(image ? { image } : {}),
    });

    const { data: inserted, error } = await context.supabase
      .from("assets")
      .insert({
        user_id: context.userId,
        project_id: project.id,
        scene_id: scene.id,
        type: "video",
        url: "",
        status: "generating",
        meta: { jobId: job.id, model: VIDEO_MODEL, seconds: scene.duration_s } as never,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return {
      assetId: (inserted as unknown as AssetRow).id,
      sceneId: scene.id,
      status: "generating",
      url: null,
    };
  });

/** Consulta o job e grava o MP4 quando ele fica pronto. */
export const checkSceneVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { assetId: string }) => input)
  .handler(async ({ data, context }): Promise<VideoAssetState> => {
    const { data: row } = await context.supabase
      .from("assets")
      .select("*")
      .eq("id", data.assetId)
      .maybeSingle();
    const asset = row as unknown as AssetRow | null;
    if (!asset) throw new Error("Clipe não encontrado.");

    const { signedUrl, uploadBinary } = await import("./media.server");

    if (asset.status === "ready" && asset.url) {
      return {
        assetId: asset.id,
        sceneId: asset.scene_id ?? "",
        status: "ready",
        url: await signedUrl(context.supabase, asset.url),
      };
    }

    const jobId = typeof asset.meta["jobId"] === "string" ? asset.meta["jobId"] : "";
    if (!jobId) {
      return {
        assetId: asset.id,
        sceneId: asset.scene_id ?? "",
        status: "error",
        url: null,
        error: "Este clipe não tem um job associado. Gere novamente.",
      };
    }

    const { getVideoJob, downloadVideo } = await import("./ai/video.server");
    try {
      const job = await getVideoJob(jobId);
      if (job.status === "failed") {
        const error = job.error?.message ?? "O provedor recusou a geração deste clipe.";
        await context.supabase
          .from("assets")
          .update({ status: "error", meta: { ...asset.meta, error } as never })
          .eq("id", asset.id);
        return { assetId: asset.id, sceneId: asset.scene_id ?? "", status: "error", url: null, error };
      }
      if (job.status !== "completed") {
        return {
          assetId: asset.id,
          sceneId: asset.scene_id ?? "",
          status: "generating",
          url: null,
          ...(typeof job.progress === "number" ? { progress: job.progress } : {}),
        };
      }

      const bytes = await downloadVideo(jobId);
      const path = await uploadBinary(
        context.supabase,
        context.userId,
        `${asset.project_id}/videos/${asset.scene_id ?? asset.id}.mp4`,
        bytes,
        "video/mp4",
      );
      await context.supabase
        .from("assets")
        .update({ url: path, status: "ready" })
        .eq("id", asset.id);
      return {
        assetId: asset.id,
        sceneId: asset.scene_id ?? "",
        status: "ready",
        url: await signedUrl(context.supabase, path),
      };
    } catch (error) {
      const messageText = fail(error);
      await context.supabase
        .from("assets")
        .update({ status: "error", meta: { ...asset.meta, error: messageText } as never })
        .eq("id", asset.id);
      return {
        assetId: asset.id,
        sceneId: asset.scene_id ?? "",
        status: "error",
        url: null,
        error: messageText,
      };
    }
  });
