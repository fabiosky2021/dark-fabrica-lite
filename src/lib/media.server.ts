/**
 * Geração de mídia (imagem e narração) + armazenamento no bucket privado.
 * Nunca devolve URL fictícia: se o provedor falhar, o erro sobe para a interface.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { provider } from "./ai/gateway.server";

type Client = SupabaseClient<Database>;

export const BUCKET = "assets";

export async function uploadBinary(
  supabase: Client,
  userId: string,
  path: string,
  bytes: Uint8Array,
  mime: string,
): Promise<string> {
  const full = `${userId}/${path}`;
  const body = new Blob([bytes as unknown as BlobPart], { type: mime });
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(full, body, { contentType: mime, upsert: true });
  if (error) throw new Error(`Falha ao salvar o arquivo gerado: ${error.message}`);
  return full;
}

export async function signedUrl(supabase: Client, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 12);
  if (error || !data?.signedUrl) throw new Error("Não foi possível abrir o arquivo salvo.");
  return data.signedUrl;
}

export async function generateSceneImage(
  supabase: Client,
  userId: string,
  projectId: string,
  sceneId: string,
  prompt: string,
  negativePrompt: string,
): Promise<string> {
  const { bytes, mime } = await provider.image(prompt, negativePrompt);
  const ext = mime.includes("jpeg") ? "jpg" : "png";
  return uploadBinary(supabase, userId, `${projectId}/scenes/${sceneId}.${ext}`, bytes, mime);
}

export async function generateThumbnailImage(
  supabase: Client,
  userId: string,
  projectId: string,
  conceptId: string,
  prompt: string,
  negativePrompt: string,
): Promise<string> {
  const { bytes, mime } = await provider.image(prompt, negativePrompt);
  const ext = mime.includes("jpeg") ? "jpg" : "png";
  return uploadBinary(supabase, userId, `${projectId}/thumbnails/${conceptId}.${ext}`, bytes, mime);
}

export async function generateNarration(
  supabase: Client,
  userId: string,
  projectId: string,
  text: string,
  voice: string,
): Promise<{ path: string; chars: number }> {
  const clipped = text.slice(0, 4000);
  const { bytes, mime } = await provider.speech({ text: clipped, voice });
  const path = await uploadBinary(
    supabase,
    userId,
    `${projectId}/narration/narration.mp3`,
    bytes,
    mime,
  );
  return { path, chars: clipped.length };
}
