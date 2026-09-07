import type { ChannelConfig, ChannelDNA, PipelineStep } from "@/types";

export const appConfig = {
  app: {
    name: "Fábrica Dark IA",
    subtitle: "Sua linha de produção de conteúdo com inteligência artificial.",
    version: "0.1.0",
    mode: "lite",
    language: "pt-BR",
  },
  settings: {
    animations: true,
    reducedMotion: false,
    autoSave: true,
  },
} as const;

export const basePipeline: PipelineStep[] = [
  { id: "strategy", name: "Estratégia", icon: "target", status: "idle", progress: 0 },
  { id: "script", name: "Roteiro", icon: "file-text", status: "idle", progress: 0 },
  { id: "storyboard", name: "Storyboard", icon: "clapperboard", status: "idle", progress: 0 },
  { id: "visual", name: "Prompts Visuais", icon: "image", status: "idle", progress: 0 },
  { id: "thumbnail", name: "Thumbnail", icon: "layout", status: "idle", progress: 0 },
  { id: "seo", name: "SEO", icon: "search", status: "idle", progress: 0 },
  { id: "quality", name: "Controle de Qualidade", icon: "shield-check", status: "idle", progress: 0 },
];

export const emptyChannel: ChannelConfig = {
  name: "",
  niche: "",
  language: "Português Brasileiro",
  format: "long-form",
  duration: "10-15 minutos",
  style: "Cinematográfico",
};

export const demoChannel: ChannelConfig = {
  name: "Filmes Bíblicos Épicos",
  niche: "Filmes bíblicos cinematográficos",
  language: "Português Brasileiro",
  format: "long-form",
  duration: "10-15 minutos",
  style: "Cinematográfico",
};

export const demoIdea = "O último dia antes do Dilúvio";

export const defaultDNA: ChannelDNA = {
  niche: "Filmes bíblicos cinematográficos",
  tone: "Narrativa grave, contemplativa e dramática",
  visualStyle: "Cinematográfico realista, luz volumétrica, paleta terrosa",
  defaultDuration: "10-15 minutos",
  hookType: "Pergunta + tensão nos primeiros 8 segundos",
  thumbnailStyle: "Rosto em close, contraste alto, texto curto em caixa alta",
  titleType: "Curiosidade + revelação",
  voice: "Masculina grave, ritmo lento",
  audience: "Adultos 25-65 interessados em histórias bíblicas",
  rules: "Sem clickbait falso. Sem violência gráfica. Sempre encerrar com reflexão.",
};
