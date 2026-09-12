import { fal } from "@fal-ai/client";

export interface FalVideoRequest {
  prompt: string;
  model: string;
  duration?: number;
  aspectRatio?: string;
}

export interface FalVideoJob {
  requestId: string;
  model: string;
  provider: "fal";
}

function getFalKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY não está configurada no ambiente server-side.");
  }
  return key;
}

/**
 * Prepara uma submissão server-side para um modelo de vídeo fal.ai.
 * Esta função não é chamada automaticamente e não consome créditos até ser invocada.
 */
export async function submitFalVideo(request: FalVideoRequest): Promise<FalVideoJob> {
  const key = getFalKey();
  fal.config({ credentials: key });

  const result = await fal.queue.submit(request.model, {
    input: {
      prompt: request.prompt,
      ...(request.duration === undefined ? {} : { duration: request.duration }),
      ...(request.aspectRatio === undefined ? {} : { aspect_ratio: request.aspectRatio }),
    },
  });

  return {
    requestId: result.request_id,
    model: request.model,
    provider: "fal",
  };
}

export async function getFalVideoStatus(model: string, requestId: string) {
  const key = getFalKey();
  fal.config({ credentials: key });
  return fal.queue.status(model, { requestId, logs: false });
}

export async function getFalVideoResult<T = unknown>(model: string, requestId: string): Promise<T> {
  const key = getFalKey();
  fal.config({ credentials: key });
  const result = await fal.queue.result(model, { requestId });
  return result.data as T;
}

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY);
}

export const falVideoConfig = {
  envVar: "FAL_KEY",
  provider: "fal.ai",
  model: "not selected — must be configured per video model availability",
} as const;
