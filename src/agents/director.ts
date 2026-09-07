import type { AgentInput, AgentOutput, Scene, ScriptBlock, VisualPrompt } from "@/types";
import { aiService } from "@/services/aiService";
import { imageService } from "@/services/imageService";

const BASE: Array<Omit<Scene, "id" | "index">> = [
  {
    duration: 8,
    location: "Cidade antiga ao amanhecer",
    character: "Noé",
    action: "Observa o céu carregado em silêncio.",
    camera: "Plano aberto cinematográfico",
    emotion: "Pressentimento",
  },
  {
    duration: 10,
    location: "Mercado movimentado",
    character: "Multidão",
    action: "Pessoas negociam e riem, alheias ao aviso.",
    camera: "Travelling lateral",
    emotion: "Ironia",
  },
  {
    duration: 9,
    location: "Estaleiro da arca",
    character: "Família",
    action: "Carregam os últimos mantimentos.",
    camera: "Plano médio",
    emotion: "Urgência",
  },
  {
    duration: 7,
    location: "Colina",
    character: "Ancião",
    action: "Aponta para o horizonte escurecendo.",
    camera: "Contra-plongée",
    emotion: "Temor",
  },
  {
    duration: 12,
    location: "Porta da arca",
    character: "Noé",
    action: "A porta se fecha sozinha.",
    camera: "Close dramático",
    emotion: "Inevitabilidade",
  },
  {
    duration: 10,
    location: "Céu sobre a cidade",
    character: "—",
    action: "A primeira gota rompe o silêncio.",
    camera: "Plano detalhe em slow motion",
    emotion: "Choque",
  },
];

export async function runDirector(
  input: AgentInput,
  _script?: ScriptBlock[],
): Promise<AgentOutput<Scene[]>> {
  const scenes: Scene[] = BASE.map((s, i) => ({ ...s, id: `sc-${i + 1}`, index: i + 1 }));
  return aiService.complete(input, scenes);
}

export async function runVisualPrompts(
  input: AgentInput,
  scenes: Scene[],
): Promise<AgentOutput<VisualPrompt[]>> {
  const prompts: VisualPrompt[] = scenes.map((s) => ({
    sceneId: s.id,
    prompt: imageService.generatePrompt(
      `${s.location.toLowerCase()}, ${s.character.toLowerCase()}, ${s.action.toLowerCase()}`,
      input.channel.style || "cinematográfico",
    ),
    negative: imageService.negativePrompt(),
    style: input.channel.style || "Cinematográfico",
    camera: s.camera,
    lighting: "Luz volumétrica, contraste alto, hora dourada",
    aspectRatio: "16:9",
  }));
  return aiService.complete(input, prompts);
}
