/**
 * Geração real de vídeo pelo Lovable AI Gateway (endpoint /v1/videos).
 *
 * O trabalho é assíncrono: cria-se o job, consulta-se o status e só depois
 * o MP4 é baixado. Nada aqui devolve resultado simulado — se o provedor
 * falhar, o erro sobe para a interface.
 */
import { AIError } from "./gateway.server";

const VIDEOS = "https://ai.gateway.lovable.dev/v1/videos";

export const VIDEO_MODEL = "google/gemini-omni-1.1-flash";

export type VideoJobStatus = "queued" | "in_progress" | "completed" | "failed";

export interface VideoJob {
  id: string;
  status: VideoJobStatus;
  progress?: number;
  error?: { code?: string; message?: string };
}

function key(): string {
  const value = process.env["LOVABLE_API_KEY"];
  if (!value) {
    throw new AIError(
      401,
      "Gerador de vídeo não configurado: LOVABLE_API_KEY ausente no servidor.",
    );
  }
  return value;
}

function friendly(status: number, body: string): string {
  if (status === 402)
    return "Créditos de IA insuficientes para gerar o vídeo. Adicione créditos e tente novamente.";
  if (status === 403) return "Geração de vídeo bloqueada para este espaço de trabalho.";
  if (status === 429)
    return "Muitos vídeos em geração ao mesmo tempo. Aguarde a cena atual terminar.";
  if (status === 401) return "Credencial de IA inválida no servidor.";
  return `Falha na geração de vídeo (${status}). ${body.slice(0, 300)}`;
}

async function readError(res: Response): Promise<never> {
  const text = await res.text().catch(() => "");
  let message = text;
  try {
    const json = JSON.parse(text) as { message?: string };
    if (json.message) message = json.message;
  } catch {
    /* corpo não-JSON */
  }
  throw new AIError(res.status, friendly(res.status, message));
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export interface CreateVideoInput {
  prompt: string;
  seconds: number;
  aspectRatio?: string;
  resolution?: "360p" | "720p" | "1080p";
  /** Primeiro quadro opcional: anima a imagem já gerada da cena. */
  image?: { base64: string; mime: string };
}

export async function createVideoJob(input: CreateVideoInput): Promise<VideoJob> {
  const seconds = Math.min(10, Math.max(3, Math.round(input.seconds || 5)));
  const parts: unknown[] = [{ type: "text", text: input.prompt }];
  if (input.image) {
    parts.unshift({ type: "image", data: input.image.base64, mime_type: input.image.mime });
  }
  const format: Record<string, unknown> = {
    type: "video",
    resolution: input.resolution ?? "720p",
    duration: `${seconds}s`,
  };
  // aspect_ratio só é válido em gerações novas sem imagem de referência.
  if (!input.image && input.aspectRatio) {
    format["aspect_ratio"] = input.aspectRatio === "9:16" ? "9:16" : "16:9";
  }

  const res = await fetch(VIDEOS, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: VIDEO_MODEL,
      input: parts,
      response_format: format,
    }),
  });
  if (!res.ok) await readError(res);
  return (await res.json()) as VideoJob;
}

export async function getVideoJob(id: string): Promise<VideoJob> {
  const res = await fetch(`${VIDEOS}/${id}`, {
    headers: { Authorization: `Bearer ${key()}` },
  });
  if (!res.ok) await readError(res);
  return (await res.json()) as VideoJob;
}

export async function downloadVideo(id: string): Promise<Uint8Array> {
  const res = await fetch(`${VIDEOS}/${id}/content`, {
    headers: { Authorization: `Bearer ${key()}` },
  });
  if (!res.ok) await readError(res);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) throw new AIError(502, "O vídeo gerado veio vazio.");
  return bytes;
}
