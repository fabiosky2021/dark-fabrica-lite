import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Badge, ScoreBar } from "@/components/ui-kit";
import { useFactory } from "@/hooks/useFactory";

export const Route = createFileRoute("/agentes")({
  head: () => ({
    meta: [
      { title: "Agentes | Fábrica Dark IA" },
      {
        name: "description",
        content: "Status dos agentes simulados durante a produção de conteúdo.",
      },
      { property: "og:title", content: "Agentes | Fábrica Dark IA" },
      {
        property: "og:description",
        content: "Estrategista, roteirista, diretor, thumbnail, SEO e qualidade.",
      },
    ],
  }),
  component: AgentesPage,
});

const DESCRICOES: Record<string, string> = {
  strategy: "Define tema, ângulo narrativo e potencial da ideia.",
  script: "Escreve o roteiro em blocos: hook, desenvolvimento e fechamento.",
  storyboard: "Divide o roteiro em cenas com câmera, ação e emoção.",
  visual: "Gera prompts visuais prontos para modelos de imagem.",
  thumbnail: "Propõe conceitos de capa com estimativa de CTR.",
  seo: "Cria títulos, descrição, tags e capítulos.",
  quality: "Avalia a produção e aprova ou reprova o resultado.",
};

const TONE = {
  idle: "muted",
  processing: "warning",
  completed: "success",
  error: "danger",
} as const;

const LABEL = {
  idle: "Aguardando",
  processing: "Executando",
  completed: "Concluído",
  error: "Erro",
} as const;

function AgentesPage() {
  const { pipeline, ceo, running } = useFactory();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Agentes</h1>
        <p className="text-sm text-muted-foreground">
          Equipe simulada que executa cada etapa da esteira.
        </p>
      </div>

      <Panel title="CEO da Fábrica" className="mb-6">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Status: </span>
            <Badge tone={running ? "warning" : "success"}>{ceo.status}</Badge>
          </p>
          <p>
            <span className="text-muted-foreground">Etapa atual: </span>
            {ceo.step}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Missão: </span>
            {ceo.mission}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Decisão: </span>
            {ceo.decision}
          </p>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        {pipeline.map((step) => (
          <Panel key={step.id}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{step.name}</h3>
              <Badge tone={TONE[step.status]}>{LABEL[step.status]}</Badge>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">{DESCRICOES[step.id]}</p>
            <ScoreBar label="Progresso" value={step.progress} />
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
