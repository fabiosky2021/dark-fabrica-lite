import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Stat, Badge, Button, DemoTag } from "@/components/ui-kit";
import { useFactory } from "@/hooks/useFactory";
import { analyticsService } from "@/services/analyticsService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Fábrica Dark IA" },
      {
        name: "description",
        content:
          "Painel da Fábrica Dark IA: produções, ideias, roteiros, thumbnails e projetos concluídos.",
      },
      { property: "og:title", content: "Dashboard | Fábrica Dark IA" },
      {
        property: "og:description",
        content: "Acompanhe suas produções de conteúdo com agentes de IA simulados.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { projects, ceo, running } = useFactory();
  const s = analyticsService.summary(projects);
  const recent = projects.slice(0, 5);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Sua linha de produção de conteúdo com inteligência artificial.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoTag />
          <Link to="/fabrica">
            <Button>Nova produção</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Produções" value={s.producoes} />
        <Stat label="Ideias" value={s.ideias} />
        <Stat label="Roteiros" value={s.roteiros} />
        <Stat label="Thumbnails" value={s.thumbnails} />
        <Stat label="Concluídos" value={s.concluidos} hint={`Score médio ${s.scoreMedio}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Produções recentes">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma produção ainda. Comece pela Fábrica.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span className="ml-auto">
                    <Badge tone={p.status === "done" ? "success" : p.status === "producing" ? "warning" : "muted"}>
                      {p.status === "done" ? "Concluído" : p.status === "producing" ? "Produzindo" : "Rascunho"}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="CEO da Fábrica">
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Status: </span>
              <Badge tone={running ? "warning" : "success"}>{ceo.status}</Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Missão: </span>
              {ceo.mission}
            </p>
            <p>
              <span className="text-muted-foreground">Etapa: </span>
              {ceo.step}
            </p>
            <p>
              <span className="text-muted-foreground">Decisão: </span>
              {ceo.decision}
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
