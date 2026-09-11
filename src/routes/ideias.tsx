import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Panel, ScoreBar, Stat } from "@/components/ui-kit";
import { useFactory } from "@/hooks/useFactory";

export const Route = createFileRoute("/ideias")({
  head: () => ({
    meta: [
      { title: "Ideias | Fábrica Dark IA" },
      { name: "description", content: "Laboratório de oportunidades para novas produções." },
    ],
  }),
  component: IdeasPage,
});

const opportunities = [
  {
    title: "O lado invisível das cidades inteligentes",
    niche: "Tecnologia",
    score: 92,
    reason: "Alta curiosidade + forte potencial de retenção",
  },
  {
    title: "Por que sua memória está mentindo para você",
    niche: "Ciência",
    score: 88,
    reason: "Pergunta universal com promessa visual",
  },
  {
    title: "A economia secreta dos objetos descartáveis",
    niche: "Documentário",
    score: 84,
    reason: "Ângulo original para assunto cotidiano",
  },
  {
    title: "O arquivo que mudou uma guerra",
    niche: "História",
    score: 81,
    reason: "Conflito claro e excelente gancho",
  },
];

function IdeasPage() {
  const { projects } = useFactory();
  const active = projects.filter((p) => p.status === "producing").length;
  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" />
            <Badge tone="primary">Laboratório editorial</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold">Ideias com potencial de produção</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Oportunidades organizadas por curiosidade, retenção e facilidade de execução.
          </p>
        </div>
        <Link to="/fabrica">
          <Button>
            <Sparkles className="size-4" /> Criar produção
          </Button>
        </Link>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Oportunidades" value={opportunities.length} hint="Curadas para explorar" />
        <Stat label="Score médio" value="86/100" hint="Potencial editorial" />
        <Stat label="Em produção" value={active} hint="Projetos ativos" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Panel
          title="Radar de oportunidades"
          action={<Badge tone="success">Atualizado agora</Badge>}
        >
          <div className="space-y-3">
            {opportunities.map((idea, index) => (
              <article
                key={idea.title}
                className="rounded-md border border-border bg-surface-2 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{idea.title}</h2>
                      <Badge>{idea.niche}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{idea.reason}</p>
                    <div className="mt-3">
                      <ScoreBar label="Potencial" value={idea.score} />
                    </div>
                  </div>
                  <Link
                    to="/fabrica"
                    search={{ idea: idea.title }}
                    aria-label={`Usar ideia ${idea.title}`}
                  >
                    <ArrowRight className="mt-1 size-4 text-muted-foreground" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Sinais do momento">
            <div className="space-y-4 text-sm">
              <p className="flex items-center gap-2">
                <Flame className="size-4 text-warning" />
                <span>Temas com maior energia</span>
                <strong className="ml-auto">Ciência</strong>
              </p>
              <p className="flex items-center gap-2">
                <TrendingUp className="size-4 text-success" />
                <span>Formato em alta</span>
                <strong className="ml-auto">Mini-doc</strong>
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Gancho recomendado</span>
                <strong className="ml-auto">“O que ninguém viu”</strong>
              </p>
            </div>
          </Panel>
          <Panel title="Como usar">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Escolha uma oportunidade e envie o briefing para a Fábrica. O projeto começa como
              rascunho para você ajustar antes de consumir qualquer geração.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

export default IdeasPage;
