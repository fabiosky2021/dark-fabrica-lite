import type { ChannelDNA, ProjectConfig } from "@/types";

export const appConfig = {
  app: {
    name: "Fábrica Dark IA",
    subtitle: "Sua linha de produção de conteúdo com inteligência artificial.",
    version: "2.0.0",
    language: "pt-BR",
  },
} as const;

export const defaultConfig: ProjectConfig = {
  channel: "",
  niche: "",
  language: "pt-BR",
  durationMinutes: 20,
  sceneSeconds: 5,
  aspectRatio: "16:9",
  style: "Cinematográfico",
  format: "long-form",
  audience: "Adultos 25-65",
  voice: "onyx",
};

export const exampleConfig: ProjectConfig = {
  ...defaultConfig,
  channel: "Filmes Bíblicos Épicos",
  niche: "Filmes bíblicos cinematográficos",
  audience: "Adultos 25-65 interessados em histórias bíblicas",
};

export const exampleTheme = "O último dia antes do Dilúvio";

export const defaultDNA: ChannelDNA = {
  niche: "Filmes bíblicos cinematográficos",
  tone: "Narrativa grave, contemplativa e dramática",
  visualStyle: "Cinematográfico realista, luz volumétrica, paleta terrosa",
  defaultDuration: "20 minutos",
  hookType: "Pergunta + tensão nos primeiros 8 segundos",
  thumbnailStyle: "Rosto em close, contraste alto, texto curto em caixa alta",
  titleType: "Curiosidade + revelação",
  voice: "Masculina grave, ritmo lento",
  audience: "Adultos 25-65 interessados em histórias bíblicas",
  rules: "Sem clickbait falso. Sem violência gráfica. Sempre encerrar com reflexão.",
};

export const VOICES = ["onyx", "alloy", "echo", "fable", "nova", "shimmer"] as const;
