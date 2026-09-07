import type { AgentInput, AgentOutput, Strategy } from "@/types";
import { aiService } from "@/services/aiService";

export async function runStrategist(input: AgentInput): Promise<AgentOutput<Strategy>> {
  const strategy: Strategy = {
    theme: input.idea,
    angle: `Mostrar as últimas horas antes de "${input.idea.toLowerCase()}", em ritmo cinematográfico.`,
    goal: "Criar curiosidade e retenção nos primeiros 30 segundos.",
    audience: `Pessoas interessadas em ${input.channel.niche.toLowerCase() || "histórias cinematográficas"}.`,
    potential: 92,
  };
  return aiService.complete(input, strategy);
}
