import { createFileRoute } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap | Fábrica Dark IA" },
      { name: "description", content: "O que já existe e as próximas evoluções da Fábrica Dark IA." },
      { property: "og:title", content: "Roadmap | Fábrica Dark IA" },
      { property: "og:description", content: "Da versão lite às APIs reais de IA, imagem, voz e vídeo." },
    ],
  }),
  component: RoadmapPage,
});

const FASES = [
  {
    fase: "Fase 1 — Lite (atual)",
    done: true,
    itens: [
      "Interface completa em modo demonstração",
      "Agentes simulados e esteira de produção",
      "Persistência local no navegador",
    ],
  },
  {
    fase: "Fase 2 — IA real",
    done: false,
    itens: ["Geração de roteiro por IA", "Títulos e SEO reais", "Controle de qualidade assistido"],
  },
  {
    fase: "Fase 3 — Mídia",
    done: false,
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
