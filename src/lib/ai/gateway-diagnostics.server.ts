import { createServerFn } from "@tanstack/react-start";
import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface GatewayDiagnosticInput {
  providerId: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export interface GatewayDiagnosticResult {
  gateway: "ok" | "failed";
  provider: "configured" | "not-configured";
  endpoint: "ok" | "failed";
  authentication: "ok" | "failed";
  model: "ok" | "failed";
  chatCompletions: "ok" | "failed";
  fallback: "configured" | "not-tested";
  routing: "configured" | "not-tested";
  latencyMs: number;
  error?: string;
  localEndpoint: boolean;
}

const diagnosticMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) =>
  next(),
);

function safeError(status: number, body: string) {
  if (status === 401 || status === 403) return "Autenticação recusada pelo provider.";
  if (status === 404) return "Endpoint ou modelo não encontrado.";
  if (status === 429) return "Limite de requisições atingido pelo provider.";
  if (status >= 500) return "O provider retornou um erro temporário.";
  return body.slice(0, 240) || `Provider respondeu HTTP ${status}.`;
}

export const diagnoseGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, diagnosticMiddleware])
  .inputValidator((input: GatewayDiagnosticInput) => {
    if (!input.providerId || !input.baseUrl || !input.model)
      throw new Error("Configuração incompleta.");
    if (
      !/^https:\/\//i.test(input.baseUrl) &&
      !/^http:\/\/127\.0\.0\.1(?::\d+)?(?:\/|$)/i.test(input.baseUrl)
    ) {
      throw new Error("Use um endpoint HTTPS ou 127.0.0.1 local.");
    }
    return { ...input, timeoutMs: Math.min(Math.max(input.timeoutMs || 30000, 1000), 120000) };
  })
  .handler(async ({ data }): Promise<GatewayDiagnosticResult> => {
    const started = Date.now();
    const base = data.baseUrl.replace(/\/$/, "");
    const localEndpoint = /127\.0\.0\.1/i.test(base);
    const configured =
      data.providerId === "9router" ||
      Boolean(process.env.LOVABLE_API_KEY || process.env.AI_GATEWAY_API_KEY);
    if (!configured) {
      return {
        gateway: "failed",
        provider: "not-configured",
        endpoint: "failed",
        authentication: "failed",
        model: "failed",
        chatCompletions: "failed",
        fallback: "not-tested",
        routing: "not-tested",
        latencyMs: Date.now() - started,
        error: "Nenhuma credencial server-side configurada para este provider.",
        localEndpoint,
      };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), data.timeoutMs);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const key =
        data.providerId === "9router"
          ? process.env.NINE_ROUTER_API_KEY
          : process.env.LOVABLE_API_KEY || process.env.AI_GATEWAY_API_KEY;
      if (key) headers.Authorization = `Bearer ${key}`;
      const models = await fetch(`${base}/models`, { headers, signal: controller.signal });
      if (!models.ok) {
        const body = await models.text().catch(() => "");
        return {
          gateway: "ok",
          provider: "configured",
          endpoint: "failed",
          authentication: models.status === 401 || models.status === 403 ? "failed" : "ok",
          model: "failed",
          chatCompletions: "failed",
          fallback: "not-tested",
          routing: "not-tested",
          latencyMs: Date.now() - started,
          error: safeError(models.status, body),
          localEndpoint,
        };
      }
      const chat = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: data.model,
          messages: [{ role: "user", content: "Responda apenas: OK" }],
          max_tokens: 4,
        }),
      });
      const latencyMs = Date.now() - started;
      if (!chat.ok) {
        const body = await chat.text().catch(() => "");
        return {
          gateway: "ok",
          provider: "configured",
          endpoint: "ok",
          authentication: chat.status === 401 || chat.status === 403 ? "failed" : "ok",
          model: chat.status === 404 ? "failed" : "ok",
          chatCompletions: "failed",
          fallback: "not-tested",
          routing: "not-tested",
          latencyMs,
          error: safeError(chat.status, body),
          localEndpoint,
        };
      }
      return {
        gateway: "ok",
        provider: "configured",
        endpoint: "ok",
        authentication: "ok",
        model: "ok",
        chatCompletions: "ok",
        fallback: "configured",
        routing: "configured",
        latencyMs,
        localEndpoint,
      };
    } catch (error) {
      return {
        gateway: "ok",
        provider: "configured",
        endpoint: "failed",
        authentication: "failed",
        model: "failed",
        chatCompletions: "failed",
        fallback: "not-tested",
        routing: "not-tested",
        latencyMs: Date.now() - started,
        error:
          error instanceof DOMException && error.name === "AbortError"
            ? "Tempo limite excedido ao contatar o endpoint."
            : "Não foi possível alcançar o endpoint.",
        localEndpoint,
      };
    } finally {
      clearTimeout(timer);
    }
  });

export const _diagnosticServerOnly = true;
