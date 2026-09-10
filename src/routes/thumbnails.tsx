import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Copy, Image as ImageIcon, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, DemoTag, Panel, ScoreBar } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { useCurrentProject } from "@/hooks/useFactory";

export const Route = createFileRoute("/thumbnails")({
  head: () => ({
    meta: [
      { title: "Thumbnails | Fábrica Dark IA" },
      {
        name: "description",
        content: "Galeria de referências e conceitos de thumbnail para novas produções.",
      },
    ],
  }),
  component: ThumbsPage,
});

const inspiration = [
  {
    image: "/inspiration/thumbnail-ciencia.png",
    tag: "Ciência",
    title: "A memória não é um arquivo",
    hook: "Contraste entre intimidade e mistério",
  },
  {
    image: "/inspiration/thumbnail-historia.png",
    tag: "História",
    title: "O documento que ninguém abriu",
    hook: "Objeto único + promessa de descoberta",
  },
  {
    image: "/inspiration/thumbnail-tecnologia.png",
    tag: "Tecnologia",
    title: "A cidade que observa você",
    hook: "Escala humana contra sistema invisível",
  },
];

function ThumbsPage() {
  const project = useCurrentProject();
  const concepts = project?.thumbnails;
  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            <Badge tone="primary">Direção visual</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold">Thumbnails</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Referências prontas para destravar o próximo vídeo e conceitos ligados ao projeto atual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoTag />
          <Link to="/ideias">
            <Button variant="outline">
              <Sparkles className="size-4" /> Buscar ideias
            </Button>
          </Link>
        </div>
      </div>
      <Panel title="Galeria de inspiração" action={<Badge tone="success">3 referências</Badge>}>
        <div className="grid gap-4 md:grid-cols-3">
          {inspiration.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-md border border-border bg-surface-2"
            >
              <img
                src={item.image}
                alt={`Referência visual: ${item.title}`}
                className="aspect-video w-full object-cover"
              />
              <div className="p-4">
                <Badge tone="primary">{item.tag}</Badge>
                <h2 className="mt-3 font-medium">{item.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.hook}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                  onClick={() => navigator.clipboard?.writeText(item.title)}
                >
                  <Copy className="size-3.5" /> Copiar conceito
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      {concepts ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <ArrowRight className="size-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Conceitos do projeto atual</h2>
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
                </dl>
                <div className="mt-4">
                  <ScoreBar label="CTR potencial" value={c.ctr} />
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Nenhum projeto selecionado"
            description="Use a galeria para encontrar uma direção ou comece uma produção na Fábrica."
          />
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        As referências são imagens editoriais geradas para inspiração. Conceitos de projeto só ficam
        disponíveis depois do pipeline criar um briefing.
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

export default ThumbsPage;
