import type { Project } from "@/types";

/** Métricas locais calculadas a partir dos projetos salvos. */
export const analyticsService = {
  mode: "demo" as const,
  summary(projects: Project[]) {
    const done = projects.filter((p) => p.status === "done");
    const scores = done.map((p) => p.score).filter(Boolean);
    return {
      producoes: projects.length,
      ideias: projects.filter((p) => p.idea.trim().length > 0).length,
      roteiros: projects.filter((p) => p.script?.length).length,
      thumbnails: projects.filter((p) => p.thumbnails?.length).length,
      concluidos: done.length,
      scoreMedio: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    };
  },
};
