import { fal } from "@fal-ai/client";

export const KLING_V3_STANDARD_I2V_MODEL = "fal-ai/kling-video/v3/standard/image-to-video" as const;

export type KlingVideoDuration = "3" | "5" | "7" | "10" | "12" | "15";
export type KlingVideoAspectRatio = "16:9" | "9:16" | "1:1";

export interface FalVideoRequest {
  prompt: string;
  model: string;
  duration?: number;
  aspectRatio?: string;
}

export interface KlingV3StandardImageToVideoRequest {
  prompt: string;
  image_url: string;
  duration?: KlingVideoDuration;
  aspect_ratio?: KlingVideoAspectRatio;
  generate_audio?: boolean;
}

export interface KlingV3StandardImageToVideoResponse {
  video: {
    file_size: number;
    content_type: "video/mp4" | string;
    file_name: string;
    url: string;
  };
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

/**
 * Prepara uma submissão do Kling V3 Standard image-to-video.
 * Não é chamada por nenhum fluxo automático; só executa quando invocada explicitamente.
 * O campo público `image_url` é convertido para o nome real exigido pelo schema: `start_image_url`.
 */
export async function submitKlingV3StandardImageToVideo(
  request: KlingV3StandardImageToVideoRequest,
): Promise<FalVideoJob> {
  const key = getFalKey();
  fal.config({ credentials: key });

  const result = await fal.queue.submit(KLING_V3_STANDARD_I2V_MODEL, {
    input: {
      prompt: request.prompt,
      start_image_url: request.image_url,
      ...(request.duration === undefined ? {} : { duration: request.duration }),
      ...(request.aspect_ratio === undefined ? {} : { aspect_ratio: request.aspect_ratio }),
      ...(request.generate_audio === undefined ? {} : { generate_audio: request.generate_audio }),
    },
  });

  return {
    requestId: result.request_id,
    model: KLING_V3_STANDARD_I2V_MODEL,
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
