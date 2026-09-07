import type { AgentInput, AgentOutput, SeoPack } from "@/types";
import { aiService } from "@/services/aiService";

export async function runSeo(input: AgentInput): Promise<AgentOutput<SeoPack>> {
  const idea = input.idea;
  const pack: SeoPack = {
    titles: [
      { title: "NINGUÉM ACREDITOU EM NOÉ — ATÉ O CÉU SE ABRIR", ctr: 94, curiosity: 95, clarity: 90, potential: 93 },
      { title: `${idea.toUpperCase()} — O QUE REALMENTE ACONTECEU`, ctr: 90, curiosity: 88, clarity: 93, potential: 90 },
      { title: "AS ÚLTIMAS 24 HORAS ANTES DO FIM DO MUNDO ANTIGO", ctr: 89, curiosity: 92, clarity: 86, potential: 89 },
      { title: "A PORTA SE FECHOU SOZINHA — E ENTÃO TUDO MUDOU", ctr: 87, curiosity: 93, clarity: 82, potential: 87 },
      { title: "O AVISO QUE O MUNDO IGNOROU POR 100 ANOS", ctr: 85, curiosity: 89, clarity: 84, potential: 86 },
    ],
    description: `${idea}: uma reconstrução cinematográfica das horas finais, narrada passo a passo. Um vídeo de ${input.channel.duration} sobre ${input.channel.niche || "história"}.`,
    keywords: ["história bíblica", "dilúvio", "noé", "documentário cinematográfico", "arca"],
    hashtags: ["#biblia", "#historia", "#documentario", "#cinematografico", "#dark"],
    chapters: [
      "00:00 O aviso",
      "01:20 O mundo antes",
      "03:40 A escalada",
      "07:10 A porta se fecha",
      "10:30 O que restou",
    ],
    tags: ["noé", "dilúvio", "história bíblica", "arca de noé", "canal dark", "narrativa épica"],
  };
  return aiService.complete(input, pack);
}
