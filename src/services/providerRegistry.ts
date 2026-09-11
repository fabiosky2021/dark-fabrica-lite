import { storageService } from "@/services/storageService";

export type ProviderKind = "gateway" | "openai-compatible" | "local";
export type ProviderStatus = "configured" | "needs-key" | "offline";

export interface AIProviderConfig {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  capabilities: string[];
  status: ProviderStatus;
  priority: number;
  timeoutMs: number;
  retries: number;
  freeTier: boolean;
  keyEnv?: string;
  updatedAt: string;
}

const KEY = "ai-providers";

const defaults: AIProviderConfig[] = [
  {
    id: "vercel-gateway",
    name: "Vercel AI Gateway",
    kind: "gateway",
    baseUrl: "https://ai-gateway.vercel.sh/v1",
    model: "google/gemini-2.5-flash-lite",
    capabilities: ["Texto", "Visão"],
    status: "configured",
    priority: 1,
    timeoutMs: 120000,
    retries: 2,
    freeTier: false,
    keyEnv: "AI_GATEWAY_API_KEY",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "9router",
    name: "9Router (OpenAI-compatible)",
    kind: "openai-compatible",
    baseUrl: "http://127.0.0.1:20128/v1",
    model: "auto",
    capabilities: ["Texto", "Fallback"],
    status: "needs-key",
    priority: 2,
    timeoutMs: 60000,
    retries: 2,
    freeTier: true,
    updatedAt: new Date().toISOString(),
  },
];

export function getProviders(): AIProviderConfig[] {
  return storageService.get<AIProviderConfig[]>(KEY, defaults);
}

export function saveProviders(providers: AIProviderConfig[]) {
  storageService.set(KEY, providers);
}

export function maskSecret(value: string) {
  if (!value) return "Não configurada";
  if (value.length < 8) return "••••••••";
  return `${value.slice(0, 3)}••••••${value.slice(-3)}`;
}

export async function testProvider(
  provider: AIProviderConfig,
): Promise<{ ok: boolean; latencyMs: number; message: string }> {
  const started = performance.now();
  try {
    const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/models`, {
      signal: AbortSignal.timeout(provider.timeoutMs),
    });
    const latencyMs = Math.round(performance.now() - started);
    if (!response.ok)
      return { ok: false, latencyMs, message: `Endpoint respondeu HTTP ${response.status}.` };
    return { ok: true, latencyMs, message: "Endpoint respondeu e está acessível." };
  } catch {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      message: "Não foi possível alcançar o endpoint. Verifique se o 9Router está em execução.",
    };
  }
}

export const freeModels = [
  { provider: "9Router", model: "auto", detail: "Roteamento para modelos disponíveis localmente" },
  {
    provider: "Vercel AI Gateway",
    model: "google/gemini-2.5-flash-lite",
    detail: "Baixo custo, não é ilimitado",
  },
  {
    provider: "Vercel AI Gateway",
    model: "openai/gpt-oss-20b",
    detail: "Open-weight, cobrança conforme disponibilidade",
  },
];

export const routingAgents = [
  "Estrategista",
  "Títulos",
  "Roteiro",
  "Cenas",
  "Prompts",
  "SEO",
  "Qualidade",
];
