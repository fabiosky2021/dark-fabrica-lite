import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, Button, Input, Badge } from "@/components/ui-kit";
import { ProjectList } from "@/components/ProjectList";
import { factory, useFactory } from "@/hooks/useFactory";
import { demoChannel } from "@/data/appConfig";
import { runPipeline } from "@/agents/orchestrator";

export const Route = createFileRoute("/ideias")({
  head: () => ({
    meta: [
      { title: "Ideias | Fábrica Dark IA" },
      { name: "description", content: "Banco de ideias e histórico de temas das suas produções." },
      { property: "og:title", content: "Ideias | Fábrica Dark IA" },
      { property: "og:description", content: "Guarde ideias e transforme-as em produções completas." },
    ],
  }),
  component: IdeiasPage,
});

const SUGESTOES = [
  "O último dia antes do Dilúvio",
  "A noite em que Jericó caiu",
  "O silêncio de 400 anos entre os testamentos",
  "O que Davi viu antes de enfrentar Golias",
];

function IdeiasPage() {
  const { projects, running } = useFactory();
  const [idea, setIdea] = useState("");

  const criar = (texto: string) => {
    if (!texto.trim()) return;
    const p = factory.createProject(texto, demoChannel);
    setIdea("");
    void runPipeline(p.id);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Ideias</h1>
        <p className="text-sm text-muted-foreground">
          Registre uma ideia e envie direto para a esteira de produção.
        </p>
      </div>

      <Panel title="Nova ideia" className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-56 flex-1"
            placeholder="Ex.: O último dia antes do Dilúvio"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && criar(idea)}
          />
          <Button disabled={running || !idea.trim()} onClick={() => criar(idea)}>
            <Sparkles size={16} /> Produzir
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button key={s} onClick={() => setIdea(s)} className="text-left">
              <Badge>{s}</Badge>
            </button>
          ))}
        </div>
      </Panel>

      <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Ideias registradas</h2>
      {projects.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Nenhuma ideia registrada ainda.</p>
        </Panel>
      ) : (
        <ProjectList projects={projects} />
      )}
    </AppShell>
  );
}
