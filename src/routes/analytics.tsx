import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Clock3, FileText, Play, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Panel, ScoreBar, Stat } from "@/components/ui-kit";
import { useFactory } from "@/hooks/useFactory";
import { analyticsService } from "@/services/analyticsService";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | Fábrica Dark IA" },
      { name: "description", content: "Métricas do pipeline editorial e audiovisual." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { projects } = useFactory();
  const summary = analyticsService.summary(projects);
  const done = projects.filter((p) => p.status === "done").length;
  const producing = projects.filter((p) => p.status === "producing").length;
  const draft = projects.filter((p) => p.status === "draft").length;
  const completion = projects.length ? Math.round((done / projects.length) * 100) : 0;
  return (
    <AppShell>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <Badge tone="primary">Visão operacional</Badge>
        </div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe a saúde da sua linha de produção, do briefing ao vídeo final.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projetos" value={projects.length} hint="No workspace atual" />
        <Stat label="Taxa de conclusão" value={`${completion}%`} hint="Projetos finalizados" />
        <Stat label="Score médio" value={summary.scoreMedio} hint="Qualidade editorial" />
        <Stat label="Em andamento" value={producing} hint="Jobs ativos" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Funil de produção">
          <div className="space-y-5">
            <Funnel
              icon={FileText}
              label="Rascunhos"
              value={draft}
              total={projects.length}
              tone="muted"
            />
            <Funnel
              icon={Play}
              label="Produzindo"
              value={producing}
              total={projects.length}
              tone="warning"
            />
            <Funnel
              icon={CheckCircle2}
              label="Concluídos"
              value={done}
              total={projects.length}
              tone="success"
            />
          </div>
        </Panel>
        <Panel title="Saúde do pipeline">
          <div className="space-y-5">
            <ScoreBar label="Briefings estruturados" value={projects.length ? 100 : 0} />
            <ScoreBar label="Roteiros gerados" value={projects.length ? 100 : 0} />
            <ScoreBar label="QC aprovado" value={completion} />
            <ScoreBar label="Exportação MP4" value={0} />
          </div>
          <div className="mt-5 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning">
            A exportação MP4 permanece bloqueada até conectar um renderizador real e aprovar o
            controle de qualidade.
          </div>
        </Panel>
      </div>
      <Panel className="mt-6" title="Próximas ações">
        <div className="grid gap-3 sm:grid-cols-3">
          <Action
            icon={Target}
            title="Criar briefing"
            text="Abra uma ideia e comece um projeto."
            href="/ideias"
          />
          <Action
            icon={Clock3}
            title="Ver produções"
            text="Acompanhe jobs e estados."
            href="/producoes"
          />
          <Action
            icon={BarChart3}
            title="Abrir fábrica"
            text="Execute as etapas do pipeline."
            href="/fabrica"
          />
        </div>
      </Panel>
    </AppShell>
  );
}
function Funnel({
  icon: Icon,
  label,
  value,
  total,
  tone,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  total: number;
  tone: "muted" | "warning" | "success";
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-sm">{label}</span>
      <div className="ml-auto flex items-center gap-3">
        <div className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full ${tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-muted-foreground"}`}
            style={{ width: `${total ? Math.max(value ? 8 : 0, (value / total) * 100) : 0}%` }}
          />
        </div>
        <strong className="w-6 text-right text-sm">{value}</strong>
      </div>
    </div>
  );
}
function Action({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: typeof Target;
  title: string;
  text: string;
  href: "/ideias" | "/producoes" | "/fabrica";
}) {
  return (
    <Link
      to={href}
      className="rounded-md border border-border bg-surface-2 p-4 transition-colors hover:border-primary/50"
    >
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </Link>
  );
}

export default AnalyticsPage;
