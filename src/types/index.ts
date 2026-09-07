export type StepStatus = "idle" | "processing" | "completed" | "error";

export type StepId =
  | "strategy"
  | "script"
  | "storyboard"
  | "visual"
  | "thumbnail"
  | "seo"
  | "quality";

export interface PipelineStep {
  id: StepId;
  name: string;
  icon: string;
  status: StepStatus;
  progress: number;
}

export interface ChannelConfig {
  name: string;
  niche: string;
  language: string;
  format: string;
  duration: string;
  style: string;
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

export interface Strategy {
  theme: string;
  angle: string;
  goal: string;
  audience: string;
  potential: number;
}

export interface ScriptBlock {
  id: string;
  label: string;
  content: string;
}

export interface Scene {
  id: string;
  index: number;
  duration: number;
  location: string;
  character: string;
  action: string;
  camera: string;
  emotion: string;
}

export interface VisualPrompt {
  sceneId: string;
  prompt: string;
  negative: string;
  style: string;
  camera: string;
  lighting: string;
  aspectRatio: string;
}

export interface ThumbnailConcept {
  id: string;
  label: string;
  title: string;
  description: string;
  composition: string;
  text: string;
  emotion: string;
  prompt: string;
  ctr: number;
}

export interface SeoTitle {
  title: string;
  ctr: number;
  curiosity: number;
  clarity: number;
  potential: number;
}

export interface SeoPack {
  titles: SeoTitle[];
  description: string;
  keywords: string[];
  hashtags: string[];
  chapters: string[];
  tags: string[];
}

export interface QualityReport {
  script: number;
  narrative: number;
  hook: number;
  continuity: number;
  seo: number;
  thumbnail: number;
  overall: number;
  approved: boolean;
}

export interface Project {
  id: string;
  title: string;
  idea: string;
  channel: ChannelConfig;
  createdAt: string;
  status: "draft" | "producing" | "done";
  currentStep: StepId | null;
  score: number;
  strategy?: Strategy;
  script?: ScriptBlock[];
  scenes?: Scene[];
  prompts?: VisualPrompt[];
  thumbnails?: ThumbnailConcept[];
  seo?: SeoPack;
  quality?: QualityReport;
}

export interface AgentInput {
  channel: ChannelConfig;
  idea: string;
  project?: Project;
}

export interface AgentOutput<T> {
  ok: boolean;
  mode: "demo" | "api";
  data: T;
}
