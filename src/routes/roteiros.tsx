import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Textarea, Badge } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { factory, useCurrentProject } from "@/hooks/useFactory";
import { scriptStats } from "@/agents/writer";

export const Route = createFileRoute("/roteiros")({
  head: () => ({
    meta: [
      { title: "Roteiros | Fábrica Dark IA" },
      { name: "description", content: "Editor de roteiro em blocos com contagem de palavras e duração." },
      { property: "og:title", content: "Roteiros" },
      { property: "og:description", content: "Editor de roteiro da Fábrica Dark IA." },
    ],
  }),
  component: RoteirosPage,
});

function RoteirosPage() {
  const project = useCurrentProject();
  const script = project?.script;

  if (!project || !script) {
    return (
      <AppShell>
        <EmptyState title="Nenhum roteiro ainda" />
      </AppShell>
    );
  }

  const stats = scriptStats(script);

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">Roteiro</h1>
        <Badge tone="primary">{project.title}</Badge>
        <div className="ml-auto flex gap-4 text-xs text-muted-foreground">
          <span>{stats.words} palavras</span>
          <span>{stats.chars} caracteres</span>
          <span>~{stats.minutes} min</span>
        </div>
      </div>

      <div className="space-y-4">
        {script.map((block) => (
          <Panel key={block.id} title={block.label}>
            <Textarea
              value={block.content}
              onChange={(e) =>
                factory.updateProject(project.id, {
                  script: script.map((b) =>
                    b.id === block.id ? { ...b, content: e.target.value } : b,
                  ),
                })
              }
            />
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
