import type { AgentInput, AgentOutput, QualityReport } from "@/types";
import { aiService } from "@/services/aiService";

export async function runQuality(input: AgentInput): Promise<AgentOutput<QualityReport>> {
  const base: Omit<QualityReport, "overall" | "approved"> = {
    script: 94,
    narrative: 91,
    hook: 96,
    continuity: 88,
    seo: 93,
    thumbnail: 90,
  };
  const values = Object.values(base);
  const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return aiService.complete(input, { ...base, overall, approved: overall >= 85 });
}
