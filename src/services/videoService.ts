/** Renderização de vídeo: preparado para API futura. */
export const videoService = {
  mode: "demo" as const,
  async renderVideo(): Promise<{ ok: false; reason: string }> {
    return { ok: false, reason: "Modo demonstração — renderização não conectada." };
  },
};
