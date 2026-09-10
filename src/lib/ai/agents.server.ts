/**
 * Agentes de texto. Cada agente tem responsabilidade única, entrada e saída
 * tipadas, validação da resposta e erros explícitos. Todos usam a mesma
 * camada de serviço de IA (`chatJSON` do gateway server-side).
 */
import { AIError, chatJSON } from "./gateway.server";
import type {
  ProjectConfig,
  ProjectData,
  QualityReport,
  ScriptPack,
  SeoPack,
  Strategy,
  ThumbnailConcept,
  TitlePack,
  VisualBible,
} from "@/types";

export interface SceneDraft {
  idx: number;
  start_s: number;
  end_s: number;
  duration_s: number;
  narration: string;
  action: string;
  characters: string[];
  location: string;
  camera: string;
  movement: string;
  lighting: string;
  atmosphere: string;
  effects: string;
  prompt: string;
  negative_prompt: string;
}

export const NEGATIVE_PROMPT =
  "low quality, blurry, deformed face, extra fingers, bad anatomy, extra limbs, duplicate character, watermark, logo, text, artifacts";

function ctx(theme: string, config: ProjectConfig): string {
  return [
    `TEMA: ${theme}`,
    `CANAL: ${config.channel || "canal dark"}`,
    `NICHO: ${config.niche || "narrativa cinematográfica"}`,
    `IDIOMA: ${config.language}`,
    `DURAÇÃO ALVO: ${config.durationMinutes} minutos`,
    `DURAÇÃO DE CENA: ${config.sceneSeconds} segundos`,
    `FORMATO: ${config.format} (${config.aspectRatio})`,
    `ESTILO: ${config.style}`,
    `PÚBLICO: ${config.audience}`,
  ].join("\n");
}

const BASE_SYSTEM =
  "Você é um agente especialista de uma produtora de vídeos para canais dark. " +
  "Escreve em português do Brasil, com precisão factual, sem clickbait enganoso " +
  "e sem copiar obras de terceiros.";

function need<T>(value: T | undefined | null, message: string): T {
  if (value === undefined || value === null) throw new AIError(422, message);
  return value;
}

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/* ------------------------------- ESTRATÉGIA ------------------------------ */

export async function runStrategist(theme: string, config: ProjectConfig): Promise<Strategy> {
  const out = await chatJSON<Partial<Strategy>>({
    system: `${BASE_SYSTEM} Você é o AGENTE ESTRATEGISTA.`,
    user: `${ctx(theme, config)}

Defina a estratégia editorial do vídeo. Responda no formato:
{"angle":"","goal":"","audience":"","hook":"","pillars":["","",""],"potential":0}
O campo potential é um inteiro de 0 a 100 com o potencial real do tema.`,
    maxTokens: 4000,
  });
  return {
    angle: need(out.angle, "Estratégia incompleta: ângulo ausente."),
    goal: out.goal ?? "",
    audience: out.audience ?? config.audience,
    hook: out.hook ?? "",
    pillars: arr<string>(out.pillars),
    potential: num(out.potential, 0),
  };
}

/* --------------------------------- TÍTULOS ------------------------------- */

export async function runTitles(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
): Promise<TitlePack> {
  const out = await chatJSON<Partial<TitlePack>>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE TÍTULOS.`,
    user: `${ctx(theme, config)}
ESTRATÉGIA: ${JSON.stringify(data.strategy ?? {})}

Gere 10 títulos honestos e magnéticos (sem clickbait enganoso). Formato:
{"titles":[{"title":"","hook":"","promise":"","curiosity":0,"clarity":0,"potential":0}],"best":""}
Notas de 0 a 100. "best" é o texto exato do melhor título da lista.`,
    maxTokens: 6000,
  });
  const titles = arr<TitlePack["titles"][number]>(out.titles).map((t) => ({
    title: String(t.title ?? ""),
    hook: String(t.hook ?? ""),
    promise: String(t.promise ?? ""),
    curiosity: num(t.curiosity, 0),
    clarity: num(t.clarity, 0),
    potential: num(t.potential, 0),
  }));
  if (titles.length === 0) throw new AIError(422, "Nenhum título retornado pela IA.");
  return { titles, best: out.best ?? titles[0]!.title };
}

/* --------------------------------- ROTEIRO ------------------------------- */

const BLOCKS = [
  "GANCHO",
  "CONTEXTO",
  "APRESENTAÇÃO",
  "CONFLITO",
  "ESCALADA",
  "VIRADA",
  "DESENVOLVIMENTO",
  "NOVA VIRADA",
  "CLÍMAX",
  "RESOLUÇÃO",
  "EPÍLOGO",
  "CTA",
];

export async function runWriter(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
): Promise<ScriptPack> {
  const words = Math.round(config.durationMinutes * 140);
  const out = await chatJSON<{ blocks?: { label?: string; content?: string }[] }>({
    system: `${BASE_SYSTEM} Você é o AGENTE ROTEIRISTA.`,
    user: `${ctx(theme, config)}
TÍTULO ESCOLHIDO: ${data.titles?.best ?? theme}
ESTRATÉGIA: ${JSON.stringify(data.strategy ?? {})}

Escreva o roteiro de narração completo, com aproximadamente ${words} palavras no total
(${config.durationMinutes} minutos a ~140 palavras/minuto). Não repita frases para preencher tempo.
Blocos obrigatórios, nesta ordem: ${BLOCKS.join(", ")}.
Formato: {"blocks":[{"label":"GANCHO","content":"texto narrado"}]}`,
    maxTokens: 24000,
  });
  const blocks = arr<{ label?: string; content?: string }>(out.blocks)
    .map((b) => ({ label: String(b.label ?? ""), content: String(b.content ?? "").trim() }))
    .filter((b) => b.content.length > 0);
  if (blocks.length < 4) throw new AIError(422, "Roteiro retornado incompleto pela IA.");
  const total = blocks.map((b) => b.content).join(" ");
  const count = total.trim().split(/\s+/).length;
  return {
    blocks,
    words: count,
    estimatedMinutes: Math.round((count / 140) * 10) / 10,
  };
}

export function scriptText(script: ScriptPack | undefined): string {
  return (script?.blocks ?? []).map((b) => b.content).join("\n\n");
}

/* ------------------------------ BÍBLIA VISUAL ---------------------------- */

export async function runBible(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
): Promise<VisualBible> {
  const out = await chatJSON<Partial<VisualBible>>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE BÍBLIA VISUAL. Sua função é garantir continuidade visual absoluta.`,
    user: `${ctx(theme, config)}
ROTEIRO:
${scriptText(data.script).slice(0, 12000)}

Crie a bíblia visual reutilizável em todas as cenas. Formato:
{"characters":[{"name":"","age":"","appearance":"","face":"","hair":"","beard":"","clothing":"","accessories":"","traits":""}],
"locations":[{"name":"","architecture":"","era":"","weather":"","lighting":"","materials":"","atmosphere":""}],
"objects":[{"name":"","appearance":"","size":"","material":"","traits":""}],
"paletteAndStyle":""}
Descrições visuais em detalhe, sempre concretas.`,
    maxTokens: 12000,
  });
  const bible: VisualBible = {
    characters: arr(out.characters),
    locations: arr(out.locations),
    objects: arr(out.objects),
    paletteAndStyle: out.paletteAndStyle ?? "",
  };
  if (bible.characters.length === 0 && bible.locations.length === 0) {
    throw new AIError(422, "Bíblia visual retornada vazia pela IA.");
  }
  return bible;
}

/* ---------------------------------- CENAS -------------------------------- */

export async function runDirector(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
): Promise<SceneDraft[]> {
  const text = scriptText(data.script);
  if (!text) throw new AIError(422, "Gere o roteiro antes das cenas.");
  const target = Math.max(
    6,
    Math.min(120, Math.round((config.durationMinutes * 60) / config.sceneSeconds)),
  );
  const out = await chatJSON<{ scenes?: Partial<SceneDraft>[] }>({
    system: `${BASE_SYSTEM} Você é o AGENTE DIRETOR DE CENAS.`,
    user: `${ctx(theme, config)}
BÍBLIA VISUAL: ${JSON.stringify(data.bible ?? {}).slice(0, 8000)}
ROTEIRO:
${text.slice(0, 20000)}

Divida a narração em ${target} cenas de ${config.sceneSeconds}s, em ordem, cobrindo o roteiro inteiro
sem sobreposição de tempo. Cada cena carrega o trecho exato da narração.
Formato: {"scenes":[{"idx":1,"start_s":0,"end_s":${config.sceneSeconds},"narration":"","action":"","characters":[""],"location":"","camera":"","movement":"","lighting":"","atmosphere":"","effects":""}]}`,
    maxTokens: 28000,
  });
  const raw = arr<Partial<SceneDraft>>(out.scenes);
  if (raw.length === 0) throw new AIError(422, "Nenhuma cena retornada pela IA.");
  return raw.map((s, i) => {
    const start = num(s.start_s, i * config.sceneSeconds);
    const end = num(s.end_s, start + config.sceneSeconds);
    return {
      idx: num(s.idx, i + 1),
      start_s: start,
      end_s: end,
      duration_s: Math.max(1, Math.round(end - start)),
      narration: String(s.narration ?? ""),
      action: String(s.action ?? ""),
      characters: arr<string>(s.characters).map(String),
      location: String(s.location ?? ""),
      camera: String(s.camera ?? ""),
      movement: String(s.movement ?? ""),
      lighting: String(s.lighting ?? ""),
      atmosphere: String(s.atmosphere ?? ""),
      effects: String(s.effects ?? ""),
      prompt: "",
      negative_prompt: NEGATIVE_PROMPT,
    };
  });
}

/* ------------------------------ CONTINUIDADE ----------------------------- */

export interface ContinuityFix {
  idx: number;
  issue: string;
  fixedAction: string;
  fixedCharacters: string[];
  fixedLocation: string;
}

export async function runContinuity(
  config: ProjectConfig,
  data: ProjectData,
  scenes: SceneDraft[],
): Promise<ContinuityFix[]> {
  const out = await chatJSON<{ fixes?: Partial<ContinuityFix>[] }>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE CONTINUIDADE.`,
    user: `BÍBLIA VISUAL: ${JSON.stringify(data.bible ?? {}).slice(0, 8000)}
ESTILO: ${config.style}
CENAS: ${JSON.stringify(
      scenes.map((s) => ({
        idx: s.idx,
        action: s.action,
        characters: s.characters,
        location: s.location,
      })),
    ).slice(0, 18000)}

Aponte apenas as cenas com quebra de continuidade (personagem, roupa, local, época, lógica temporal)
e devolva a versão corrigida delas. Se estiver tudo certo, devolva {"fixes":[]}.
Formato: {"fixes":[{"idx":1,"issue":"","fixedAction":"","fixedCharacters":[""],"fixedLocation":""}]}`,
    maxTokens: 12000,
  });
  return arr<Partial<ContinuityFix>>(out.fixes).map((f) => ({
    idx: num(f.idx, 0),
    issue: String(f.issue ?? ""),
    fixedAction: String(f.fixedAction ?? ""),
    fixedCharacters: arr<string>(f.fixedCharacters).map(String),
    fixedLocation: String(f.fixedLocation ?? ""),
  }));
}

/* --------------------------------- PROMPTS ------------------------------- */

export async function runVisualPrompts(
  config: ProjectConfig,
  data: ProjectData,
  scenes: SceneDraft[],
): Promise<{ idx: number; prompt: string }[]> {
  const out = await chatJSON<{ prompts?: { idx?: number; prompt?: string }[] }>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE PROMPTS VISUAIS. Escreve prompts em inglês para geradores de imagem.`,
    user: `ESTILO: ${config.style} | PROPORÇÃO: ${config.aspectRatio}
BÍBLIA VISUAL: ${JSON.stringify(data.bible ?? {}).slice(0, 9000)}
CENAS: ${JSON.stringify(
      scenes.map((s) => ({
        idx: s.idx,
        action: s.action,
        characters: s.characters,
        location: s.location,
        camera: s.camera,
        movement: s.movement,
        lighting: s.lighting,
        atmosphere: s.atmosphere,
        effects: s.effects,
      })),
    ).slice(0, 20000)}

Para CADA cena escreva um prompt cinematográfico em inglês com a estrutura:
personagem + aparência (copiada da bíblia visual) + local + época + ação + expressão +
composição + câmera + movimento + iluminação + atmosfera + estilo.
Formato: {"prompts":[{"idx":1,"prompt":"..."}]}`,
    maxTokens: 28000,
  });
  const prompts = arr<{ idx?: number; prompt?: string }>(out.prompts)
    .map((p, i) => ({ idx: num(p.idx, i + 1), prompt: String(p.prompt ?? "").trim() }))
    .filter((p) => p.prompt.length > 0);
  if (prompts.length === 0) throw new AIError(422, "Nenhum prompt retornado pela IA.");
  return prompts;
}

/* -------------------------------- THUMBNAIL ------------------------------ */

export async function runThumbnail(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
): Promise<ThumbnailConcept[]> {
  const out = await chatJSON<{ concepts?: Partial<ThumbnailConcept>[] }>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE THUMBNAIL.`,
    user: `${ctx(theme, config)}
TÍTULO: ${data.titles?.best ?? theme}
BÍBLIA VISUAL: ${JSON.stringify(data.bible ?? {}).slice(0, 6000)}

Crie 3 conceitos (A, B, C) que representem o conteúdo real do vídeo. O prompt fica em inglês.
Formato: {"concepts":[{"id":"a","label":"Conceito A","concept":"","composition":"","character":"","emotion":"","mainElement":"","text":"","prompt":"","ctr":0}]}`,
    maxTokens: 8000,
  });
  const concepts = arr<Partial<ThumbnailConcept>>(out.concepts).map((c, i) => ({
    id: String(c.id ?? ["a", "b", "c"][i] ?? i),
    label: String(c.label ?? `Conceito ${i + 1}`),
    concept: String(c.concept ?? ""),
    composition: String(c.composition ?? ""),
    character: String(c.character ?? ""),
    emotion: String(c.emotion ?? ""),
    mainElement: String(c.mainElement ?? ""),
    text: String(c.text ?? ""),
    prompt: String(c.prompt ?? ""),
    ctr: num(c.ctr, 0),
  }));
  if (concepts.length === 0) throw new AIError(422, "Nenhum conceito de thumbnail retornado.");
  return concepts;
}

/* ----------------------------------- SEO --------------------------------- */

export async function runSeo(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
): Promise<SeoPack> {
  const out = await chatJSON<Partial<SeoPack>>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE SEO PARA YOUTUBE.`,
    user: `${ctx(theme, config)}
TÍTULO: ${data.titles?.best ?? theme}
ROTEIRO (resumo): ${scriptText(data.script).slice(0, 8000)}

Formato:
{"title":"","titleVariations":["","","","",""],"description":"","chapters":["00:00 ..."],"tags":[""],"hashtags":["#..."],"pinnedComment":""}
Capítulos coerentes com a duração de ${config.durationMinutes} minutos.`,
    maxTokens: 8000,
  });
  const pack: SeoPack = {
    title: out.title ?? data.titles?.best ?? theme,
    titleVariations: arr<string>(out.titleVariations),
    description: out.description ?? "",
    chapters: arr<string>(out.chapters),
    tags: arr<string>(out.tags),
    hashtags: arr<string>(out.hashtags),
    pinnedComment: out.pinnedComment ?? "",
  };
  if (!pack.description) throw new AIError(422, "SEO retornado sem descrição.");
  return pack;
}

/* --------------------------------- QUALIDADE ----------------------------- */

export async function runQuality(
  theme: string,
  config: ProjectConfig,
  data: ProjectData,
  scenes: SceneDraft[],
): Promise<QualityReport> {
  const out = await chatJSON<Partial<QualityReport>>({
    system: `${BASE_SYSTEM} Você é o AGENTE DE CONTROLE DE QUALIDADE. É rigoroso e honesto.`,
    user: `${ctx(theme, config)}
TÍTULO: ${data.titles?.best ?? ""}
ROTEIRO: ${scriptText(data.script).slice(0, 9000)}
CENAS: ${JSON.stringify(scenes.slice(0, 60).map((s) => ({ idx: s.idx, narration: s.narration, prompt: s.prompt }))).slice(0, 12000)}
THUMBNAIL: ${JSON.stringify(data.thumbnails ?? []).slice(0, 3000)}
SEO: ${JSON.stringify(data.seo ?? {}).slice(0, 3000)}

Audite: título x roteiro, roteiro x cenas, cenas x narração, continuidade visual, repetições,
contradições, qualidade dos prompts, qualidade narrativa, thumbnail x conteúdo, SEO x conteúdo.
Formato: {"scores":[{"label":"","value":0}],"overall":0,"approved":true,"issues":[{"severity":"alta","area":"","message":"","fix":""}]}`,
    maxTokens: 10000,
  });
  const scores = arr<{ label?: string; value?: unknown }>(out.scores).map((s) => ({
    label: String(s.label ?? ""),
    value: num(s.value, 0),
  }));
  if (scores.length === 0) throw new AIError(422, "Relatório de qualidade vazio.");
  const overall = num(
    out.overall,
    Math.round(scores.reduce((a, b) => a + b.value, 0) / scores.length),
  );
  return {
    scores,
    overall,
    approved: out.approved ?? overall >= 85,
    issues: arr(out.issues),
  };
}
