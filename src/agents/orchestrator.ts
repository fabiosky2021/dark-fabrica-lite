import { factory, getState } from "@/hooks/useFactory";
import type { StepId } from "@/types";

const STEPS: StepId[] = [
  "strategy", "titles", "script", "bible", "scenes", "prompts",
  "narration", "visuals", "thumbnail", "seo", "quality",
];

/** Ponte de compatibilidade durante a migração para a arquitetura V2.
 * Nunca declara uma geração de IA como concluída sem execução real.
 */
export async function runPipeline(projectId: string): Promise<void> {
  const project = getState().projects.find((item) => item.id === projectId);
  if (!project) return;

  const first = STEPS[0];
  factory.updateProject(projectId, { status: "producing", currentStep: first });
  factory.setStep(first, { status: "running" });
  factory.setCeo({
    status: "ONLINE",
    mission: `Preparando: ${project.title}`,
    step: stepLabel(first),
    decision: "A interface V1 foi preservada; execução V2 ainda precisa ser conectada.",
  });

  await Promise.resolve();

  factory.setStep(first, { status: "error" });
  factory.updateProject(projectId, { status: "error", currentStep: first });
  factory.setCeo({
    status: "AGUARDANDO",
    mission: "Configuração pendente",
    step: stepLabel(first),
    decision: "Nenhum resultado falso foi criado. Conecte o agente de servidor V2 para executar esta etapa.",
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
