import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetResult, AssetType, Database } from "@/types";
import { provider } from "./ai/gateway.server";
import { generateSceneImage as generateFalSceneImage } from "./fal/image.server";
import { getFalVideoResult, submitKlingV3StandardImageToVideo } from "./fal/video.server";

type Client = SupabaseClient<Database>;
export const BUCKET = "assets";

function expectedMime(type: AssetType): string[] {
  if (type === "audio") return ["audio/mpeg", "audio/mp3", "audio/wav"];
  if (type === "video") return ["video/mp4", "video/webm", "video/quicktime"];
  return ["image/png", "image/jpeg", "image/webp"];
}

async function validateStoredAsset(
  supabase: Client,
  path: string,
  type: AssetType,
  mime: string,
): Promise<{ sizeBytes: number; mimeType: string }> {
  if (!path) throw new Error("ASSET_STORAGE_PATH_MISSING");
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data || data.size <= 0) throw new Error("ASSET_FILE_NOT_AVAILABLE");
  const actualMime = data.type || mime;
  if (!expectedMime(type).some((allowed) => actualMime.toLowerCase().startsWith(allowed)))
    throw new Error("ASSET_MIME_TYPE_INVALID");
  return { sizeBytes: data.size, mimeType: actualMime };
}

export async function uploadBinary(
  supabase: Client,
  userId: string,
  path: string,
  bytes: Uint8Array,
  mime: string,
): Promise<string> {
  if (!bytes.byteLength) throw new Error("ASSET_EMPTY_RESPONSE");
  const full = `${userId}/${path}`;
  const body = new Blob([bytes as unknown as BlobPart], { type: mime });
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(full, body, { contentType: mime, upsert: true });
  if (error) throw new Error(`Falha ao salvar o arquivo gerado: ${error.message}`);
  return full;
}

export async function signedUrl(supabase: Client, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 12);
  if (error || !data?.signedUrl) throw new Error("ASSET_FILE_NOT_AVAILABLE");
  return data.signedUrl;
}

async function imageAsset(
  supabase: Client,
  userId: string,
  projectId: string,
  key: string,
  prompt: string,
  negativePrompt: string,
  type: "image" | "thumbnail",
): Promise<AssetResult> {
  try {
    const falImage = await generateFalSceneImage({
      prompt: negativePrompt ? `${prompt}\n\nNegative prompt: ${negativePrompt}` : prompt,
    });
    const response = await fetch(falImage.url);
    if (!response.ok) throw new Error(`Falha ao baixar imagem fal.ai: ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const mime = response.headers.get("content-type") || falImage.contentType || "image/jpeg";
    const extension = mime.includes("png") ? "png" : "jpg";
    const path = await uploadBinary(
      supabase,
      userId,
      `${projectId}/${type === "image" ? "scenes" : "thumbnails"}/${key}.${extension}`,
      bytes,
      mime,
    );
    const valid = await validateStoredAsset(supabase, path, type, mime);
    return {
      success: true,
      assetType: type,
      status: "completed",
      storagePath: path,
      ...valid,
      provider: falImage.provider,
      metadata: { model: falImage.model },
    };
  } catch (error) {
    return {
      success: false,
      assetType: type,
      status: "failed",
      error: error instanceof Error ? error.message : "ASSET_GENERATION_FAILED",
      retryable: true,
    };
  }
}

export function generateSceneImage(
  supabase: Client,
  userId: string,
  projectId: string,
  sceneId: string,
  prompt: string,
  negativePrompt: string,
) {
  return imageAsset(supabase, userId, projectId, sceneId, prompt, negativePrompt, "image");
}
export function generateThumbnailImage(
  supabase: Client,
  userId: string,
  projectId: string,
  conceptId: string,
  prompt: string,
  negativePrompt: string,
) {
  return imageAsset(supabase, userId, projectId, conceptId, prompt, negativePrompt, "thumbnail");
}

export async function generateSceneVideo(
  supabase: Client,
  userId: string,
  projectId: string,
  sceneId: string,
  prompt: string,
  imagePath: string,
  duration: "3" | "5" | "7" | "10" | "12" | "15" = "5",
): Promise<AssetResult> {
  try {
    const imageUrl = await signedUrl(supabase, imagePath);
    const job = await submitKlingV3StandardImageToVideo({
      prompt,
      image_url: imageUrl,
      duration,
      aspect_ratio: "16:9",
      generate_audio: false,
    });
    const result = (await getFalVideoResult(job.model, job.requestId)) as {
      video?: { url?: string; content_type?: string; file_size?: number };
    };
    if (!result.video?.url) throw new Error("Kling não retornou um vídeo válido.");
    const response = await fetch(result.video.url);
    if (!response.ok) throw new Error(`Falha ao baixar vídeo fal.ai: ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const mime = response.headers.get("content-type") || result.video.content_type || "video/mp4";
    const path = await uploadBinary(
      supabase,
      userId,
      `${projectId}/scenes/${sceneId}.mp4`,
      bytes,
      mime,
    );
    const valid = await validateStoredAsset(supabase, path, "video", mime);
    return {
      success: true,
      assetType: "video",
      status: "completed",
      storagePath: path,
      ...valid,
      provider: job.provider,
      metadata: { model: job.model, requestId: job.requestId },
    };
  } catch (error) {
    return {
      success: false,
      assetType: "video",
      status: "failed",
      error: error instanceof Error ? error.message : "VIDEO_GENERATION_FAILED",
      retryable: true,
    };
  }
}

export async function generateNarration(
  supabase: Client,
  userId: string,
  projectId: string,
  text: string,
  voice: string,
): Promise<AssetResult & { chars: number }> {
  const clipped = text.slice(0, 4000);
  try {
    const { bytes, mime } = await provider.speech({ text: clipped, voice });
    const path = await uploadBinary(
      supabase,
      userId,
      `${projectId}/narration/narration.mp3`,
      bytes,
      mime,
    );
    const valid = await validateStoredAsset(supabase, path, "audio", mime);
    return {
      success: true,
      assetType: "audio",
      status: "completed",
      storagePath: path,
      ...valid,
      provider: "ai-gateway",
      chars: clipped.length,
    };
  } catch (error) {
    return {
      success: false,
      assetType: "audio",
      status: "failed",
      error: error instanceof Error ? error.message : "AUDIO_GENERATION_FAILED",
      retryable: true,
      chars: clipped.length,
    };
  }
}
