import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Stat, ScoreBar, DemoTag, Badge } from "@/components/ui-kit";
import { useFactory } from "@/hooks/useFactory";
import { analyticsService } from "@/services/analyticsService";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | Fábrica Dark IA" },
      { name: "description", content: "Métricas locais das suas produções: volume, scores e qualidade." },
      { property: "og:title", content: "Analytics | Fábrica Dark IA" },
      { property: "og:description", content: "Acompanhe o desempenho da sua linha de produção." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { projects } = useFactory();
  const s = analyticsService.summary(projects);
  const done = projects.filter((p) => p.quality);
  const avg = (k: "script" | "narrative" | "hook" | "continuity" | "seo" | "thumbnail") =>
    done.length
      ? Math.round(done.reduce((a, p) => a + (p.quality?.[k] ?? 0), 0) / done.length)
      : 0;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Métricas calculadas a partir dos projetos salvos neste navegador.
          </p>
        </div>
        <DemoTag />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produções" value={s.producoes} />
        <Stat label="Concluídas" value={s.concluidos} />
        <Stat label="Score médio" value={s.scoreMedio} hint="Controle de qualidade" />
        <Stat
          label="Taxa de conclusão"
          value={`${s.producoes ? Math.round((s.concluidos / s.producoes) * 100) : 0}%`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Qualidade média por critério">
          {done.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma produção avaliada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              <ScoreBar label="Roteiro" value={avg("script")} />
              <ScoreBar label="Narrativa" value={avg("narrative")} />
              <ScoreBar label="Hook" value={avg("hook")} />
              <ScoreBar label="Continuidade" value={avg("continuity")} />
              <ScoreBar label="SEO" value={avg("seo")} />
              <ScoreBar label="Thumbnail" value={avg("thumbnail")} />
            </div>
          )}
        </Panel>

        <Panel title="Ranking de produções">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {[...projects]
                .sort((a, b) => b.score - a.score)
                .slice(0, 8)
                .map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="w-5 text-muted-foreground">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    <Badge tone={p.score >= 80 ? "success" : p.score > 0 ? "warning" : "muted"}>
                      {p.score || "—"}
                    </Badge>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
