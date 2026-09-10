/**
 * Funções de servidor da Fábrica. Toda geração pesada acontece aqui.
 * Nenhuma chave de API é exposta ao navegador.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  AgentRunRow,
  AssetRow,
  ProjectConfig,
  ProjectData,
  ProjectRow,
  SceneRow,
  StageId,
  Stages,
} from "@/types";

export const STAGE_ORDER: StageId[] = [
  "strategy",
  "titles",
  "script",
  "bible",
  "scenes",
  "prompts",
  "narration",
  "visuals",
  "thumbnail",
  "seo",
  "quality",
];

export interface StageResult {
  ok: boolean;
  stage: StageId;
  message: string;
  error?: string;
}

function message(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Erro inesperado durante a geração.";
}

/* --------------------------------- LEITURA -------------------------------- */

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ProjectRow[];
  });

export const getProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const [project, scenes, assets, runs] = await Promise.all([
      context.supabase.from("projects").select("*").eq("id", data.id).maybeSingle(),
      context.supabase.from("scenes").select("*").eq("project_id", data.id).order("idx"),
      context.supabase
        .from("assets")
        .select("*")
        .eq("project_id", data.id)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("agent_runs")
        .select("*")
        .eq("project_id", data.id)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);
    if (project.error) throw new Error(project.error.message);
    if (!project.data) throw new Error("Projeto não encontrado.");

    const { signedUrl } = await import("./media.server");
    const assetRows = (assets.data ?? []) as unknown as AssetRow[];
    const withUrls = await Promise.all(
      assetRows.map(async (a) => {
        if (!a.url || a.status !== "ready") return a;
        try {
          return { ...a, url: await signedUrl(context.supabase, a.url) };
        } catch {
          return { ...a, status: "error" };
        }
      }),
    );

    return {
      project: project.data as unknown as ProjectRow,
      scenes: (scenes.data ?? []) as unknown as SceneRow[],
      assets: withUrls,
      runs: (runs.data ?? []) as unknown as AgentRunRow[],
    };
  });

/* ---------------------------------- CRUD ---------------------------------- */

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; theme: string; config: ProjectConfig }) => {
    if (!input.theme?.trim()) throw new Error("Informe o tema do vídeo.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("projects")
      .insert({
        user_id: context.userId,
        title: data.title.trim() || data.theme.trim(),
        theme: data.theme.trim(),
        config: data.config as never,
        data: {} as never,
        stages: {} as never,
        status: "IDEIA",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as ProjectRow;
  });

export const updateProjectConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; title?: string; config?: ProjectConfig }) => input)
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch["title"] = data.title;
    if (data.config !== undefined) patch["config"] = data.config;
    const { error } = await context.supabase
      .from("projects")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: src, error } = await context.supabase
      .from("projects")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const row = src as unknown as ProjectRow;
    const { data: copy, error: insErr } = await context.supabase
      .from("projects")
      .insert({
        user_id: context.userId,
        title: `${row.title} (cópia)`,
        theme: row.theme,
        config: row.config as never,
        data: row.data as never,
        stages: row.stages as never,
        status: row.status,
      })
      .select("*")
      .single();
    if (insErr) throw new Error(insErr.message);
    return copy as unknown as ProjectRow;
  });

/* -------------------------------- EXECUÇÃO -------------------------------- */

export const runStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { projectId: string; stage: StageId }) => input)
  .handler(async ({ data, context }): Promise<StageResult> => {
    const { supabase, userId } = context;
    const started = Date.now();
    const stage = data.stage;

    const { data: projectRow, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", data.projectId)
      .maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!projectRow) throw new Error("Projeto não encontrado.");
    const project = projectRow as unknown as ProjectRow;
    const config = project.config as ProjectConfig;
    const stages = (project.stages ?? {}) as Stages;
    const attempt = (stages[stage]?.attempt ?? 0) + 1;

    const setStage = async (patch: Partial<ProjectData>, status: "COMPLETED" | "FAILED", error?: string) => {
      const nextStages: Stages = {
        ...stages,
        [stage]: { status, attempt, error: error ?? null, updatedAt: new Date().toISOString() },
      };
      await supabase
        .from("projects")
        .update({
          data: { ...(project.data as ProjectData), ...patch } as never,
          stages: nextStages as never,
          ...(status === "COMPLETED" ? { status: statusForStage(stage) } : {}),
        } as never)
        .eq("id", project.id);
      await supabase.from("agent_runs").insert({
        project_id: project.id,
        user_id: userId,
        agent: stage,
        status,
        attempt,
        duration_ms: Date.now() - started,
        error: error ?? null,
      });
    };

    try {
      const agents = await import("./ai/agents.server");
      const media = await import("./media.server");
      const projectData = (project.data ?? {}) as ProjectData;

      const loadScenes = async (): Promise<SceneRow[]> => {
        const { data: rows, error } = await supabase
          .from("scenes")
          .select("*")
          .eq("project_id", project.id)
          .order("idx");
        if (error) throw new Error(error.message);
        return (rows ?? []) as unknown as SceneRow[];
      };

      switch (stage) {
        case "strategy": {
          const strategy = await agents.runStrategist(project.theme, config);
          await setStage({ strategy }, "COMPLETED");
          return { ok: true, stage, message: "Estratégia gerada." };
        }
        case "titles": {
          const titles = await agents.runTitles(project.theme, config, projectData);
          await setStage({ titles }, "COMPLETED");
          await supabase.from("projects").update({ title: titles.best } as never).eq("id", project.id);
          return { ok: true, stage, message: `${titles.titles.length} títulos gerados.` };
        }
        case "script": {
          const script = await agents.runWriter(project.theme, config, projectData);
          await setStage({ script }, "COMPLETED");
          return { ok: true, stage, message: `Roteiro com ${script.words} palavras.` };
        }
        case "bible": {
          const bible = await agents.runBible(project.theme, config, projectData);
          await setStage({ bible }, "COMPLETED");
          return { ok: true, stage, message: `${bible.characters.length} personagens definidos.` };
        }
        case "scenes": {
          const drafts = await agents.runDirector(project.theme, config, projectData);
          const fixes = await agents.runContinuity(config, projectData, drafts).catch(() => []);
          for (const fix of fixes) {
            const target = drafts.find((d) => d.idx === fix.idx);
            if (!target) continue;
            if (fix.fixedAction) target.action = fix.fixedAction;
            if (fix.fixedLocation) target.location = fix.fixedLocation;
            if (fix.fixedCharacters.length) target.characters = fix.fixedCharacters;
          }
          await supabase.from("scenes").delete().eq("project_id", project.id);
          const { error } = await supabase.from("scenes").insert(
            drafts.map((d) => ({ ...d, project_id: project.id, user_id: userId })) as never,
          );
          if (error) throw new Error(error.message);
          await setStage({}, "COMPLETED");
          return {
            ok: true,
            stage,
            message: `${drafts.length} cenas criadas${fixes.length ? ` · ${fixes.length} correções de continuidade` : ""}.`,
          };
        }
        case "prompts": {
          const scenes = await loadScenes();
          if (scenes.length === 0) throw new Error("Gere as cenas antes dos prompts.");
          const prompts = await agents.runVisualPrompts(config, projectData, scenes);
          for (const p of prompts) {
            const scene = scenes.find((s) => s.idx === p.idx);
            if (!scene) continue;
            await supabase
              .from("scenes")
              .update({ prompt: p.prompt, negative_prompt: agents.NEGATIVE_PROMPT } as never)
              .eq("id", scene.id);
          }
          await setStage({}, "COMPLETED");
          return { ok: true, stage, message: `${prompts.length} prompts gerados.` };
        }
        case "narration": {
          const text = agents.scriptText(projectData.script);
          if (!text) throw new Error("Gere o roteiro antes da narração.");
          const { path, chars } = await media.generateNarration(
            supabase,
            userId,
            project.id,
            text,
            config.voice,
          );
          await supabase.from("assets").insert({
            project_id: project.id,
            user_id: userId,
            type: "audio",
            url: path,
            status: "ready",
            meta: { chars, voice: config.voice } as never,
          } as never);
          await setStage({}, "COMPLETED");
          return { ok: true, stage, message: "Narração gerada e salva." };
        }
        case "visuals": {
          const scenes = await loadScenes();
          const withPrompt = scenes.filter((s) => s.prompt.trim());
          if (withPrompt.length === 0) throw new Error("Gere os prompts antes dos visuais.");
          const { data: existing } = await supabase
            .from("assets")
            .select("scene_id")
            .eq("project_id", project.id)
            .eq("type", "image")
            .eq("status", "ready");
          const done = new Set((existing ?? []).map((a) => (a as { scene_id: string | null }).scene_id));
          const pending = withPrompt.filter((s) => !done.has(s.id));
          if (pending.length === 0) {
            await setStage({}, "COMPLETED");
            return { ok: true, stage, message: "Todas as cenas já têm imagem." };
          }
          const batch = pending.slice(0, 4);
          for (const scene of batch) {
            const path = await media.generateSceneImage(
              supabase,
              userId,
              project.id,
              scene.id,
              scene.prompt,
              scene.negative_prompt || agents.NEGATIVE_PROMPT,
            );
            await supabase.from("assets").insert({
              project_id: project.id,
              scene_id: scene.id,
              user_id: userId,
              type: "image",
              url: path,
              status: "ready",
              meta: { idx: scene.idx } as never,
            } as never);
          }
          const remaining = pending.length - batch.length;
          await setStage({}, remaining > 0 ? "FAILED" : "COMPLETED", remaining > 0
            ? `${remaining} cenas ainda sem imagem. Execute novamente para continuar.`
            : undefined);
          return {
            ok: remaining === 0,
            stage,
            message: `${batch.length} imagens geradas.`,
            ...(remaining > 0
              ? { error: `Faltam ${remaining} cenas. Execute VISUAIS novamente para continuar.` }
              : {}),
          };
        }
        case "thumbnail": {
          const thumbnails = await agents.runThumbnail(project.theme, config, projectData);
          const first = thumbnails[0];
          await setStage({ thumbnails }, "COMPLETED");
          if (first?.prompt) {
            try {
              const path = await media.generateThumbnailImage(
                supabase,
                userId,
                project.id,
                first.id,
                first.prompt,
                agents.NEGATIVE_PROMPT,
              );
              await supabase.from("assets").insert({
                project_id: project.id,
                user_id: userId,
                type: "thumbnail",
                url: path,
                status: "ready",
                meta: { concept: first.id } as never,
              } as never);
            } catch (imageError) {
              return {
                ok: true,
                stage,
                message: "Conceitos de thumbnail gerados.",
                error: `A imagem do conceito A falhou: ${message(imageError)}`,
              };
            }
          }
          return { ok: true, stage, message: "Conceitos e imagem de thumbnail gerados." };
        }
        case "seo": {
          const seo = await agents.runSeo(project.theme, config, projectData);
          await setStage({ seo }, "COMPLETED");
          return { ok: true, stage, message: "Pacote de SEO gerado." };
        }
        case "quality": {
          const scenes = await loadScenes();
          const quality = await agents.runQuality(project.theme, config, projectData, scenes);
          await setStage({ quality }, "COMPLETED");
          return {
            ok: true,
            stage,
            message: `Nota geral ${quality.overall} · ${quality.issues.length} apontamentos.`,
          };
        }
        default:
          throw new Error("Etapa desconhecida.");
      }
    } catch (error) {
      const text = message(error);
      await setStage({}, "FAILED", text);
      return { ok: false, stage, message: "Falha na geração.", error: text };
    }
  });

function statusForStage(stage: StageId): ProjectRow["status"] {
  switch (stage) {
    case "strategy":
    case "titles":
      return "PLANEJAMENTO";
    case "script":
    case "bible":
      return "ROTEIRO";
    case "scenes":
    case "prompts":
      return "CENAS";
    case "narration":
      return "NARRACAO";
    case "visuals":
      return "VISUAIS";
    case "thumbnail":
    case "seo":
      return "MONTAGEM";
    case "quality":
      return "PRONTO";
    default:
      return "IDEIA";
  }
}

/* ------------------------------- COMPILAÇÃO ------------------------------- */

export const compileProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const [project, scenes, assets] = await Promise.all([
      context.supabase.from("projects").select("*").eq("id", data.id).single(),
      context.supabase.from("scenes").select("*").eq("project_id", data.id).order("idx"),
      context.supabase.from("assets").select("*").eq("project_id", data.id),
    ]);
    if (project.error) throw new Error(project.error.message);
    const row = project.data as unknown as ProjectRow;
    return {
      metadata: {
        id: row.id,
        title: row.title,
        theme: row.theme,
        status: row.status,
        config: row.config,
        exportedAt: new Date().toISOString(),
      },
      strategy: (row.data as ProjectData).strategy ?? null,
      titles: (row.data as ProjectData).titles ?? null,
      script: (row.data as ProjectData).script ?? null,
      bible: (row.data as ProjectData).bible ?? null,
      scenes: (scenes.data ?? []) as unknown as SceneRow[],
      thumbnail: (row.data as ProjectData).thumbnails ?? null,
      seo: (row.data as ProjectData).seo ?? null,
      quality: (row.data as ProjectData).quality ?? null,
      assets: ((assets.data ?? []) as unknown as AssetRow[]).map((a) => ({
        id: a.id,
        type: a.type,
        sceneId: a.scene_id,
        status: a.status,
        storagePath: a.url,
      })),
    };
  });
