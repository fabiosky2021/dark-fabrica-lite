import type { Project } from "@/types";

export const analyticsService = {
  summary(projects: Project[]) {
    const done = projects.filter((p) => p.status === "done");
    return {
      producoes: projects.length,
      ideias: projects.filter((p) => p.status === "draft").length,
      roteiros: done.length,
      thumbnails: done.length,
      concluidos: done.length,
      scoreMedio: done.length
        ? Math.round(done.reduce((sum, p) => sum + p.score, 0) / done.length)
        : 0,
    };
  },
};
