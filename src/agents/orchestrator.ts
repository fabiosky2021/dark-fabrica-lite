import { factory, getState, setState } from "@/hooks/useFactory";
import { runStrategist } from "./strategist";
import { runWriter } from "./writer";
import { runDirector, runVisualPrompts } from "./director";
import { runThumbnail } from "./thumbnail";
import { runSeo } from "./seo";
import { runQuality } from "./quality";
import type { AgentInput, Project, StepId } from "@/types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DECISIONS: Record<StepId, string> = {
  strategy: "Definir o ângulo narrativo antes de escrever.",
  script: "Enviar a estratégia aprovada para o roteirista.",
  storyboard: "Enviar o roteiro para o agente diretor.",
  visual: "Enviar a produção para o agente visual.",
  thumbnail: "Solicitar 3 conceitos de capa ao agente de thumbnail.",
  seo: "Otimizar títulos e descrição para descoberta.",
  quality: "Auditar a produção antes da aprovação final.",
};

async function step(id: StepId, name: string, work: () => Promise<Partial<Project>>) {
  factory.setStep(id, { status: "processing", progress: 15 });
  factory.setCeo({ step: name, decision: DECISIONS[id] });
  await wait(320);
  factory.setStep(id, { progress: 65 });
  const patch = await work();
  await wait(220);
  factory.setStep(id, { status: "completed", progress: 100 });
  return patch;
}

export async function runPipeline(projectId: string) {
  const s = getState();
  if (s.running) return;
  const project = s.projects.find((p) => p.id === projectId);
  if (!project) return;

  setState({ running: true });
  factory.resetPipeline();
  factory.updateProject(projectId, { status: "producing" });
  factory.setCeo({ status: "ONLINE", mission: `Produzir: ${project.title}` });

  const input: AgentInput = { channel: project.channel, idea: project.idea, project };

  const strategy = (await step("strategy", "Estratégia", async () => ({
    strategy: (await runStrategist(input)).data,
  }))) as Partial<Project>;
  factory.updateProject(projectId, { ...strategy, currentStep: "strategy" });

  const script = (await runWriter(input)).data;
  await step("script", "Roteiro", async () => ({}));
  factory.updateProject(projectId, { script, currentStep: "script" });

  const scenes = (await runDirector(input, script)).data;
  await step("storyboard", "Storyboard", async () => ({}));
  factory.updateProject(projectId, { scenes, currentStep: "storyboard" });

  const prompts = (await runVisualPrompts(input, scenes)).data;
  await step("visual", "Prompts Visuais", async () => ({}));
  factory.updateProject(projectId, { prompts, currentStep: "visual" });

  const thumbs = (await runThumbnail(input)).data;
  await step("thumbnail", "Thumbnail", async () => ({}));
  factory.updateProject(projectId, { thumbnails: thumbs, currentStep: "thumbnail" });

  const seo = (await runSeo(input)).data;
  await step("seo", "SEO", async () => ({}));
  factory.updateProject(projectId, { seo, currentStep: "seo" });

  const quality = (await runQuality(input)).data;
  await step("quality", "Controle de Qualidade", async () => ({}));
  factory.updateProject(projectId, {
    quality,
    currentStep: "quality",
    status: "done",
    score: quality.overall,
  });

  factory.setCeo({
    status: "ONLINE",
    step: "Concluído",
    decision: "Produção aprovada e salva no histórico.",
  });
  setState({ running: false });
}
