import type { AgentInput, AgentOutput, ScriptBlock } from "@/types";
import { aiService } from "@/services/aiService";

const STRUCTURE: Array<{ id: string; label: string; make: (idea: string, niche: string) => string }> = [
  {
    id: "hook",
    label: "Hook",
    make: (idea) =>
      `E se você soubesse exatamente como foi ${idea.toLowerCase()}? Nos próximos minutos, cada hora daquele dia será reconstruída.`,
  },
  {
    id: "contexto",
    label: "Contexto",
    make: (idea, niche) =>
      `O mundo seguia sua rotina. Ninguém imaginava o que estava por vir. Este é o cenário de ${idea.toLowerCase()}, dentro do universo de ${niche.toLowerCase()}.`,
  },
  {
    id: "personagens",
    label: "Personagens",
    make: () =>
      "Um homem que acreditou quando ninguém acreditava. Uma família que confiou. E uma multidão que apenas observava e ria.",
  },
  {
    id: "conflito",
    label: "Conflito",
    make: () =>
      "A descrença tomou conta. As advertências viraram piada. O tempo, porém, continuava correndo em silêncio.",
  },
  {
    id: "escalada",
    label: "Escalada",
    make: () =>
      "O céu mudou de cor. Os animais se moveram em fila. O vento parou. Algo se aproximava, e todos sentiram.",
  },
  {
    id: "climax",
    label: "Clímax",
    make: () =>
      "A porta se fechou. Não por mãos humanas. E então, a primeira gota caiu sobre uma terra que nunca tinha visto chuva.",
  },
  {
    id: "resolucao",
    label: "Resolução",
    make: () =>
      "Em poucas horas, o mundo conhecido deixou de existir. Restou apenas o que havia sido preparado com antecedência.",
  },
  {
    id: "cta",
    label: "CTA",
    make: () =>
      "Se esta história te fez pensar, deixe seu like e se inscreva. No próximo vídeo, o que aconteceu depois que as águas baixaram.",
  },
];

export async function runWriter(input: AgentInput): Promise<AgentOutput<ScriptBlock[]>> {
  const blocks: ScriptBlock[] = STRUCTURE.map((s) => ({
    id: s.id,
    label: s.label,
    content: s.make(input.idea, input.channel.niche || "conteúdo cinematográfico"),
  }));
  return aiService.complete(input, blocks);
}

export function scriptStats(blocks: ScriptBlock[]) {
  const text = blocks.map((b) => b.content).join(" ");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    words,
    chars: text.length,
    minutes: Math.max(1, Math.round((words / 140) * 10) / 10),
  };
}
