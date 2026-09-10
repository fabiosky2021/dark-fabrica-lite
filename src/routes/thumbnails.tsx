import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Badge, DemoTag, ScoreBar } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { useCurrentProject } from "@/hooks/useFactory";

export const Route = createFileRoute("/thumbnails")({
  head: () => ({
    meta: [
      { title: "Thumbnails | Fábrica Dark IA" },
      {
        name: "description",
        content: "Três conceitos de thumbnail com composição, texto e CTR estimado.",
      },
      { property: "og:title", content: "Thumbnails" },
      {
        property: "og:description",
        content: "Conceitos de capa preparados para geração futura de imagens.",
      },
    ],
  }),
  component: ThumbsPage,
});

function ThumbsPage() {
  const project = useCurrentProject();
  const concepts = project?.thumbnails;

  if (!concepts) {
    return (
      <AppShell>
        <EmptyState title="Nenhum conceito de thumbnail ainda" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">Thumbnails</h1>
        <DemoTag />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {concepts.map((c) => (
          <Panel key={c.id} title={c.label}>
            <p className="font-display text-base font-semibold">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            <dl className="mt-3 space-y-2 text-xs">
              <Item label="Composição">{c.composition}</Item>
              <Item label="Texto">
                <Badge tone="primary">{c.text}</Badge>
              </Item>
              <Item label="Emoção">{c.emotion}</Item>
              <Item label="Prompt">
                <span className="text-muted-foreground">{c.prompt}</span>
              </Item>
            </dl>
            <div className="mt-4">
              <ScoreBar label="CTR potencial" value={c.ctr} />
            </div>
          </Panel>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A geração de imagens ainda não está conectada — os prompts já estão prontos para a Fase 2.
      </p>
    </AppShell>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground uppercase">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
