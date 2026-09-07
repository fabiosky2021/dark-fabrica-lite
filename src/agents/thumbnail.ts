import type { AgentInput, AgentOutput, ThumbnailConcept } from "@/types";
import { aiService } from "@/services/aiService";
import { imageService } from "@/services/imageService";

export async function runThumbnail(input: AgentInput): Promise<AgentOutput<ThumbnailConcept[]>> {
  const style = input.channel.style || "Cinematográfico";
  const concepts: ThumbnailConcept[] = [
    {
      id: "a",
      label: "Conceito A",
      title: "Personagem + ameaça",
      description: "Rosto em close com o perigo visível ao fundo.",
      composition: "Personagem à esquerda, ameaça à direita, texto no topo.",
      text: "ELES NÃO ACREDITARAM",
      emotion: "Tensão",
      prompt: imageService.generatePrompt("close-up of a worried ancient man, dark storm behind", style),
      ctr: 92,
    },
    {
      id: "b",
      label: "Conceito B",
      title: "Grande momento dramático",
      description: "O instante exato da virada da história.",
      composition: "Plano amplo centralizado, texto na base.",
      text: "O ÚLTIMO DIA",
      emotion: "Impacto",
      prompt: imageService.generatePrompt("epic wide shot, first rain over ancient city", style),
      ctr: 88,
    },
    {
      id: "c",
      label: "Conceito C",
      title: "Mistério + personagem",
      description: "Personagem parcialmente na sombra, elemento intrigante.",
      composition: "Silhueta à direita, luz forte à esquerda.",
      text: "O QUE ELE VIU?",
      emotion: "Curiosidade",
      prompt: imageService.generatePrompt("silhouette of a man looking at a strange sky", style),
      ctr: 90,
    },
  ];
  return aiService.complete(input, concepts);
}
