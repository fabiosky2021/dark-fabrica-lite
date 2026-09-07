/** Geração de imagens: preparado para API futura. Hoje apenas prepara prompts. */
export const imageService = {
  mode: "demo" as const,
  generatePrompt(subject: string, style: string) {
    return `Cinematic ${style.toLowerCase()}, ${subject}, dramatic clouds, realistic characters, volumetric lighting, epic composition, highly detailed, 8k`;
  },
  negativePrompt() {
    return "low quality, blurry, distorted face, extra fingers, watermark, text artifacts, deformed hands";
  },
  async generateImage(): Promise<{ ok: false; reason: string }> {
    return { ok: false, reason: "Modo demonstração — gerador de imagens não conectado." };
  },
};
