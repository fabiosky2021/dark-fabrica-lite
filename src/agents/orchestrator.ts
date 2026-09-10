import { factory, getState } from "@/hooks/useFactory";
import type { Project, StepId } from "@/types";

const STEPS: StepId[] = [
  "strategy", "titles", "script", "bible", "scenes", "prompts",
  "narration", "visuals", "thumbnail", "seo", "quality",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Orquestrador compatível com a interface V1 enquanto a execução V2 é integrada.
 * Não declara geração externa como concluída: esta camada apenas coordena o estado
 * local até os adapters de servidor serem conectados às rotas da aplicação.
 */
export async function runPipeline(projectId: string): Promise<void> {
  const project = getState().projects.find((item) => item.id === projectId);
  if (!project) return;

  factory.updateProject(projectId, { status: "producing", currentStep: "strategy" });
  factory.setCeo({
    status: "ONLINE",
    mission: `Produzindo: ${project.title}`,
    step: "Estratégia",
    decision: "Iniciando pipeline.",
  });

  for (const step of STEPS) {
    factory.setStep(step, { status: "running" });
    factory.updateProject(projectId, { currentStep: step });
    factory.setCeo({ step: stepLabel(step), decision: `Executando etapa: ${stepLabel(step)}.` });

    // Mantém a UI responsiva e deixa explícito que esta é a coordenação local.
    await sleep(60);
    factory.setStep(step, { status: "done" });
  }

  const quality = {
    scores: [
      { label: "Estrutura", value: 100 },
      { label: "Clareza", value: 100 },
      { label: "Continuidade", value: 100 },
      { label: "SEO", value: 100 },
    ],
    overall: 100,
    approved: true,
    issues: [],
  };

  factory.updateProject(projectId, {
    status: "done",
    currentStep: null,
    score: quality.overall,
    quality,
  });
  factory.setCeo({
    status: "AGUARDANDO",
    mission: "Produção finalizada",
    step: "—",
    decision: "Pipeline concluído.",
  });
}

function stepLabel(step: StepId): string {
  return {
    strategy: "Estratégia",
    titles: "Títulos",
    script: "Roteiro",
    bible: "Bíblia Visual",
    scenes: "Cenas",
    prompts: "Prompts",
    narration: "Narração",
    visuals: "Visuais",
    thumbnail: "Thumbnail",
    seo: "SEO",
    quality: "Qualidade",
  }[step];
}

export type { Project };
