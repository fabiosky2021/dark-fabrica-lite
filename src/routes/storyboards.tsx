import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Input, Button, Badge } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { factory, useCurrentProject } from "@/hooks/useFactory";
import type { Scene } from "@/types";

export const Route = createFileRoute("/storyboards")({
  head: () => ({
    meta: [
      { title: "Storyboards | Fábrica Dark IA" },
      { name: "description", content: "Cenas do storyboard com câmera, emoção e prompts visuais." },
      { property: "og:title", content: "Storyboards" },
      { property: "og:description", content: "Storyboard cena a cena da produção." },
    ],
  }),
  component: StoryboardsPage,
});

function StoryboardsPage() {
  const project = useCurrentProject();
  const scenes = project?.scenes;

  if (!project || !scenes) {
    return (
      <AppShell>
        <EmptyState title="Nenhum storyboard ainda" />
      </AppShell>
    );
  }

  const update = (id: string, patch: Partial<Scene>) =>
    factory.updateProject(project.id, {
      scenes: scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });

  const addScene = () => {
    const index = scenes.length + 1;
    factory.updateProject(project.id, {
      scenes: [
        ...scenes,
        {
          id: `sc-${Date.now()}`,
          index,
          duration: 8,
          location: "",
          character: "",
          action: "",
          camera: "Plano médio",
          emotion: "",
        },
      ],
    });
  };

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">Storyboard</h1>
        <Badge tone="primary">{scenes.length} cenas</Badge>
        <Button className="ml-auto" variant="outline" onClick={addScene}>
          Adicionar cena
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scenes.map((s) => {
          const prompt = project.prompts?.find((p) => p.sceneId === s.id);
          return (
            <Panel key={s.id} title={`Cena ${String(s.index).padStart(2, "0")}`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Cell label="Duração (s)">
                  <Input
                    type="number"
                    value={s.duration}
                    onChange={(e) => update(s.id, { duration: Number(e.target.value) })}
                  />
                </Cell>
                <Cell label="Local">
                  <Input value={s.location} onChange={(e) => update(s.id, { location: e.target.value })} />
                </Cell>
                <Cell label="Personagem">
                  <Input value={s.character} onChange={(e) => update(s.id, { character: e.target.value })} />
                </Cell>
                <Cell label="Câmera">
                  <Input value={s.camera} onChange={(e) => update(s.id, { camera: e.target.value })} />
                </Cell>
                <Cell label="Ação">
                  <Input value={s.action} onChange={(e) => update(s.id, { action: e.target.value })} />
                </Cell>
                <Cell label="Emoção">
                  <Input value={s.emotion} onChange={(e) => update(s.id, { emotion: e.target.value })} />
                </Cell>
              </div>
              {prompt && (
                <p className="mt-3 rounded-md bg-surface-2 p-3 text-xs text-muted-foreground">
                  <span className="text-foreground">Prompt visual: </span>
                  {prompt.prompt}
                </p>
              )}
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-muted-foreground uppercase">{label}</span>
      {children}
    </label>
  );
}
