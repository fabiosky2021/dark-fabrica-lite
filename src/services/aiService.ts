import type { AgentInput, AgentOutput } from "@/types";

/**
 * Serviço de IA. Nesta versão retorna dados simulados (modo demonstração).
 * A assinatura já está pronta para receber uma API real no futuro.
 */
export const aiService = {
  mode: "demo" as const,
  async complete<T>(_input: AgentInput, data: T): Promise<AgentOutput<T>> {
    return { ok: true, mode: "demo", data };
  },
};
