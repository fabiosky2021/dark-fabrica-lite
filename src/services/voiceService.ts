/** Narração: preparado para API futura. */
export const voiceService = {
  mode: "demo" as const,
  async generateVoice(): Promise<{ ok: false; reason: string }> {
    return { ok: false, reason: "Modo demonstração — narração não conectada." };
  },
};
