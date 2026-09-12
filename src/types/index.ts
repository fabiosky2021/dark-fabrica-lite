export type StageId =
  | "strategy"
  | "titles"
  | "script"
  | "bible"
  | "scenes"
  | "prompts"
  | "narration"
  | "visuals"
  | "thumbnail"
  | "seo"
  | "quality";

export type StageStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface StageState {
  status: StageStatus;
  error?: string | null;
  attempt?: number;
  updatedAt?: string;
}

export type Stages = Partial<Record<StageId, StageState>>;

export const STAGES: { id: StageId; name: string; icon: string }[] = [
  { id: "strategy", name: "Estratégia", icon: "target" },
  { id: "titles", name: "Títulos", icon: "type" },
  { id: "script", name: "Roteiro", icon: "file-text" },
  { id: "bible", name: "Bíblia Visual", icon: "book" },
  { id: "scenes", name: "Cenas", icon: "clapperboard" },
  { id: "prompts", name: "Prompts", icon: "wand" },
  { id: "narration", name: "Narração", icon: "mic" },
  { id: "visuals", name: "Visuais", icon: "image" },
  { id: "thumbnail", name: "Thumbnail", icon: "layout" },
  { id: "seo", name: "SEO", icon: "search" },
  { id: "quality", name: "Controle de Qualidade", icon: "shield-check" },
];

export type ProjectStatus =
  | "IDEIA"
  | "PLANEJAMENTO"
  | "ROTEIRO"
  | "CENAS"
  | "VISUAIS"
  | "NARRACAO"
  | "MONTAGEM"
  | "QA"
  | "PRONTO";

export interface ProjectConfig {
  channel: string;
  niche: string;
  language: string;
  durationMinutes: number;
  sceneSeconds: number;
  aspectRatio: string;
  style: string;
  format: string;
  audience: string;
  voice: string;
}

export interface Strategy {
  angle: string;
  goal: string;
  audience: string;
  hook: string;
  pillars: string[];
  potential: number;
}
export interface TitleIdea {
  title: string;
  hook: string;
  promise: string;
  curiosity: number;
  clarity: number;
  potential: number;
}
export interface TitlePack {
  titles: TitleIdea[];
  best: string;
}
export interface ScriptBlock {
  label: string;
  content: string;
}
export interface ScriptPack {
  blocks: ScriptBlock[];
  words: number;
  estimatedMinutes: number;
}
export interface BibleCharacter {
  name: string;
  age: string;
  appearance: string;
  face: string;
  hair: string;
  beard: string;
  clothing: string;
  accessories: string;
  traits: string;
}
export interface BibleLocation {
  name: string;
  architecture: string;
  era: string;
  weather: string;
  lighting: string;
  materials: string;
  atmosphere: string;
}
export interface BibleObject {
  name: string;
  appearance: string;
  size: string;
  material: string;
  traits: string;
}
export interface VisualBible {
  characters: BibleCharacter[];
  locations: BibleLocation[];
  objects: BibleObject[];
  paletteAndStyle: string;
}
export interface SceneRow {
  id: string;
  project_id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
}
export interface SeoPack {
  title: string;
  titleVariations: string[];
  description: string;
  chapters: string[];
  tags: string[];
  hashtags: string[];
  pinnedComment: string;
}
export interface ThumbnailConcept {
  id: string;
  label: string;
  concept: string;
  composition: string;
  character: string;
  emotion: string;
  mainElement: string;
  text: string;
  prompt: string;
  ctr: number;
}
export interface QualityIssue {
  severity: "alta" | "media" | "baixa";
  area: string;
  message: string;
  fix: string;
}
export interface QualityReport {
  scores: { label: string; value: number }[];
  overall: number;
  approved: boolean;
  issues: QualityIssue[];
}
export interface ProjectData {
  strategy?: Strategy;
  titles?: TitlePack;
  script?: ScriptPack;
  bible?: VisualBible;
  seo?: SeoPack;
  thumbnails?: ThumbnailConcept[];
  quality?: QualityReport;
}
export interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  config: ProjectConfig;
  data: ProjectData;
  stages: Stages;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}
export type AssetType = "image" | "audio" | "thumbnail" | "video";
export type AssetStatus = "pending" | "processing" | "completed" | "failed" | "retrying";
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface AssetResult {
  success: boolean;
  assetType: AssetType;
  status: "completed" | "failed";
  url?: string;
  storagePath?: string;
  mimeType?: string;
  sizeBytes?: number;
  provider?: string;
  error?: string;
  retryable?: boolean;
  metadata?: Record<string, Json>;
}

export interface AssetRow {
  id: string;
  project_id: string;
  scene_id: string | null;
  user_id: string;
  type: AssetType;
  url: string;
  status: AssetStatus;
  meta: Record<string, Json>;
  created_at: string;
  updated_at?: string;
}
export interface AgentRunRow {
  id: string;
  project_id: string;
  user_id: string;
  agent: string;
  status: StageStatus;
  attempt: number;
  duration_ms: number;
  error: string | null;
  created_at: string;
}
export interface ChannelDNA {
  niche: string;
  tone: string;
  visualStyle: string;
  defaultDuration: string;
  hookType: string;
  thumbnailStyle: string;
  titleType: string;
  voice: string;
  audience: string;
  rules: string;
}

// Compatibilidade com a interface V1 durante a migração para V2.
export type StepId = StageId;
export interface PipelineStep {
  id: StepId;
  label: string;
  status: "pending" | "running" | "done" | "error";
}
export interface ChannelConfig {
  name: string;
  niche: string;
  duration: string;
  language: string;
  style: string;
  format: string;
}
export interface Project {
  id: string;
  title: string;
  idea: string;
  channel: ChannelConfig;
  createdAt: string;
  status: "draft" | "producing" | "done" | "error";
  currentStep: StepId | null;
  score: number;
  quality?: QualityReport;
}
