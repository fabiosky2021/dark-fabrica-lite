import { fal } from "@fal-ai/client";

export const FLUX_KONTEXT_TEXT_TO_IMAGE_MODEL = "fal-ai/flux-pro/kontext/text-to-image" as const;

export interface FalImageGenerationRequest {
  prompt: string;
}

export interface FalImageGenerationResult {
  url: string;
  model: typeof FLUX_KONTEXT_TEXT_TO_IMAGE_MODEL;
  provider: "fal";
  contentType?: string;
  fileName?: string;
}

interface FalImageResponse {
  images?: Array<{
    url?: string;
    content_type?: string;
    file_name?: string;
  }>;
}

function getFalKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY não está configurada no ambiente server-side.");
  }
  return key;
}

/**
 * Gera uma imagem de cena usando o modelo real do fal.ai.
 * Esta função não é chamada automaticamente por nenhum fluxo do projeto.
 */
export async function generateSceneImage(
  request: FalImageGenerationRequest,
): Promise<FalImageGenerationResult> {
  const prompt = request.prompt.trim();
  if (!prompt) throw new Error("O prompt da cena é obrigatório.");

  fal.config({ credentials: getFalKey() });
  const result = await fal.subscribe(FLUX_KONTEXT_TEXT_TO_IMAGE_MODEL, {
    input: { prompt },
  });
  const image = (result.data as FalImageResponse).images?.[0];

  if (!image?.url) {
    throw new Error("O fal.ai não retornou uma URL de imagem válida.");
  }

  return {
    url: image.url,
    model: FLUX_KONTEXT_TEXT_TO_IMAGE_MODEL,
    provider: "fal",
    contentType: image.content_type,
    fileName: image.file_name,
  };
}

export function isFalImageConfigured(): boolean {
  return Boolean(process.env.FAL_KEY);
}

export const falImageConfig = {
  envVar: "FAL_KEY",
  provider: "fal.ai",
  model: FLUX_KONTEXT_TEXT_TO_IMAGE_MODEL,
  storageReady: true,
} as const;
