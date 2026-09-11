/**
 * Camada de acesso a provedores de IA.
 *
 * Provedor ativo: Lovable AI Gateway (chave server-side `LOVABLE_API_KEY`).
 * Nenhuma chave é exposta ao navegador: todo acesso acontece dentro de
 * server functions.
 *
 * Para trocar de provedor basta implementar outro objeto com a mesma
 * interface `AIProvider` e apontar `provider` para ele.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export const TEXT_MODEL = "openai/gpt-6-astra";
export const IMAGE_MODEL = "google/gemini-3.1-flash-image";
export const TTS_MODEL = "openai/gpt-4o-mini-tts";

export class AIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AIError";
    this.status = status;
  }
}

export interface AIProvider {
  chat(opts: ChatOptions): Promise<string>;
  image(prompt: string, negativePrompt?: string): Promise<{ bytes: Uint8Array; mime: string }>;
  speech(opts: SpeechOptions): Promise<{ bytes: Uint8Array; mime: string }>;
}

export interface ChatOptions {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface SpeechOptions {
  text: string;
  voice?: string;
  speed?: number;
  instructions?: string;
}

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    throw new AIError(
      401,
      "IA não configurada: a variável de ambiente LOVABLE_API_KEY não está disponível no servidor.",
    );
  }
  return key;
}

function friendly(status: number, body: string): string {
  if (status === 402) return "Créditos de IA esgotados. Adicione créditos para continuar gerando.";
  if (status === 403) return "Acesso à IA bloqueado para este espaço de trabalho.";
  if (status === 429)
    return "Limite de requisições atingido. Aguarde alguns segundos e tente novamente.";
  if (status === 401) return "Credencial de IA inválida no servidor.";
  const short = body.slice(0, 300);
  return `Falha na IA (${status}). ${short}`;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request(path: string, body: unknown, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${GATEWAY}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function requestWithRetry(path: string, body: unknown, timeoutMs: number): Promise<Response> {
  let last: AIError | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await request(path, body, timeoutMs);
    } catch {
      last = new AIError(504, "Tempo esgotado ao contatar a IA.");
      await delay(1200 * (attempt + 1));
      continue;
    }
    if (res.ok) return res;
    const text = await res.text().catch(() => "");
    const err = new AIError(res.status, friendly(res.status, text));
    if (res.status === 429 || res.status >= 500) {
      last = err;
      const retryAfter = Number(res.headers.get("Retry-After") ?? 0);
      await delay(retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
      continue;
    }
    throw err;
  }
  throw last ?? new AIError(500, "Falha desconhecida na IA.");
}

/** Chat em streaming (evita cortes de conexão em gerações longas). */
async function chat({ system, user, model, maxTokens, timeoutMs }: ChatOptions): Promise<string> {
  const res = await requestWithRetry(
    "/chat/completions",
    {
      model: model ?? TEXT_MODEL,
      stream: true,
      reasoning_effort: "low",
      max_completion_tokens: maxTokens ?? 16000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    },
    timeoutMs ?? 300000,
  );

  if (!res.body) throw new AIError(502, "Resposta vazia da IA.");
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        out += json.choices?.[0]?.delta?.content ?? "";
      } catch {
        /* fragmento incompleto */
      }
    }
  }
  if (!out.trim()) throw new AIError(502, "A IA não retornou conteúdo.");
  return out;
}

async function image(
  prompt: string,
  negativePrompt?: string,
): Promise<{ bytes: Uint8Array; mime: string }> {
  const full = negativePrompt ? `${prompt}\n\nEvitar: ${negativePrompt}` : prompt;
  const res = await requestWithRetry(
    "/chat/completions",
    {
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: full }],
    },
    240000,
  );
  const json = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
  };
  const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new AIError(502, "O gerador de imagens não retornou nenhuma imagem.");
  return decodeDataUrl(url);
}

async function speech({
  text,
  voice = "onyx",
  speed = 1,
  instructions,
}: SpeechOptions): Promise<{ bytes: Uint8Array; mime: string }> {
  const res = await requestWithRetry(
    "/audio/speech",
    {
      model: TTS_MODEL,
      input: text,
      voice,
      speed,
      response_format: "mp3",
      ...(instructions ? { instructions } : {}),
    },
    240000,
  );
  const buffer = new Uint8Array(await res.arrayBuffer());
  if (buffer.byteLength === 0) throw new AIError(502, "A narração retornou vazia.");
  return { bytes: buffer, mime: "audio/mpeg" };
}

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) throw new AIError(502, "Formato de imagem inesperado.");
  const mime = match[1] ?? "image/png";
  const binary = atob(match[2] ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, mime };
}

export const provider: AIProvider = { chat, image, speech };

/** Chat que exige uma resposta JSON válida. Valida e normaliza a saída. */
export async function chatJSON<T>(opts: ChatOptions): Promise<T> {
  const raw = await provider.chat({
    ...opts,
    system: `${opts.system}\n\nResponda SOMENTE com JSON válido, sem comentários e sem blocos de código.`,
  });
  return parseJSON<T>(raw);
}

export function parseJSON<T>(raw: string): T {
  let text = raw.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  if (fence?.[1]) text = fence[1].trim();
  const start = text.search(/[[{]/);
  const endObj = text.lastIndexOf("}");
  const endArr = text.lastIndexOf("]");
  const end = Math.max(endObj, endArr);
  if (start >= 0 && end > start) text = text.slice(start, end + 1);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AIError(502, "A IA respondeu em um formato inesperado. Tente novamente.");
  }
}
