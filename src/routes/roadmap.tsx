import { createFileRoute } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap | Fábrica Dark IA" },
      {
        name: "description",
        content: "O que já existe e as próximas evoluções da Fábrica Dark IA.",
      },
      { property: "og:title", content: "Roadmap | Fábrica Dark IA" },
      {
        property: "og:description",
        content: "A evolução da Fábrica Dark IA com autenticação, agentes, mídia e renderização.",
      },
    ],
  }),
  component: RoadmapPage,
});

const FASES = [
  {
    fase: "Fase 1 — Produção autenticada (atual)",
    done: true,
    itens: [
      "Autenticação Supabase e sessões persistentes",
      "Pipeline server-side com agentes reais",
      "Persistência de projetos e assets no Storage",
    ],
  },
  {
    fase: "Fase 2 — IA e mídia real",
    done: true,
    itens: ["Geração de roteiro por IA", "Títulos e SEO reais", "Controle de qualidade assistido"],
  },
  {
    fase: "Fase 3 — Renderização",
    done: true,
    itens: ["Geração de imagens e thumbnails", "Narração por voz", "Montagem de vídeo"],
  },
  {
    fase: "Fase 4 — Automação",
    done: false,
    itens: ["Publicação no YouTube", "Analytics real do canal", "Produção agendada"],
  },
];

function RoadmapPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Roadmap</h1>
        <p className="text-sm text-muted-foreground">Evolução planejada da Fábrica.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FASES.map((f) => (
          <Panel key={f.fase}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{f.fase}</h2>
              <Badge tone={f.done ? "success" : "muted"}>{f.done ? "Pronto" : "Planejado"}</Badge>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {f.itens.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  {f.done ? (
                    <Check size={15} className="mt-0.5 text-success" />
                  ) : (
                    <Circle size={15} className="mt-0.5" />
                  )}
                  {i}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
