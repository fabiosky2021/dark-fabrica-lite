/** Publicação no YouTube: preparado para API futura. */
export const youtubeService = {
  mode: "demo" as const,
  async publish(): Promise<{ ok: false; reason: string }> {
    return { ok: false, reason: "Modo demonstração — publicação não conectada." };
  },
};
