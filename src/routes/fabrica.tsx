import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket, Clapperboard } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Pipeline } from "@/components/Pipeline";
import { Panel, Button, Field, Input, Select, Textarea, Badge, DemoTag } from "@/components/ui-kit";
import { demoChannel, demoIdea, emptyChannel } from "@/data/appConfig";
import { factory, useCurrentProject, useFactory } from "@/hooks/useFactory";
import { runPipeline } from "@/agents/orchestrator";
import type { ChannelConfig } from "@/types";

export const Route = createFileRoute("/fabrica")({
  head: () => ({
    meta: [
      { title: "Fábrica — Nova produção | Fábrica Dark IA" },
      { name: "description", content: "Inicie uma nova produção e acompanhe a esteira de agentes." },
      { property: "og:title", content: "Fábrica — Nova produção" },
      { property: "og:description", content: "Esteira de produção de conteúdo com agentes simulados." },
    ],
  }),
  component: FabricaPage,
});

function FabricaPage() {
  const [channel, setChannel] = useState<ChannelConfig>(emptyChannel);
  const [idea, setIdea] = useState("");
  const { running, ceo } = useFactory();
  const current = useCurrentProject();

  const set = (k: keyof ChannelConfig, v: string) => setChannel((c) => ({ ...c, [k]: v }));

  const start = (c: ChannelConfig, i: string) => {
    if (!i.trim()) return;
    const p = factory.createProject(i, c);
    void runPipeline(p.id);
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Nova produção</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados do canal e inicie a esteira.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={running}
          onClick={() => {
            setChannel(demoChannel);
            setIdea(demoIdea);
            start(demoChannel, demoIdea);
          }}
        >
          <Clapperboard size={16} /> DEMO
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="Dados da produção" action={<DemoTag />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do canal">
              <Input
                value={channel.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Filmes Bíblicos Épicos"
              />
            </Field>
            <Field label="Nicho">
              <Input
                value={channel.niche}
                onChange={(e) => set("niche", e.target.value)}
                placeholder="Filmes bíblicos cinematográficos"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tema / ideia do vídeo">
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="O último dia antes do Dilúvio"
                />
              </Field>
            </div>
            <Field label="Duração">
              <Select value={channel.duration} onChange={(e) => set("duration", e.target.value)}>
                <option>3-5 minutos</option>
                <option>5-10 minutos</option>
                <option>10-15 minutos</option>
                <option>15-25 minutos</option>
              </Select>
            </Field>
            <Field label="Idioma">
              <Select value={channel.language} onChange={(e) => set("language", e.target.value)}>
                <option>Português Brasileiro</option>
                <option>Inglês</option>
                <option>Espanhol</option>
              </Select>
            </Field>
            <Field label="Estilo">
              <Select value={channel.style} onChange={(e) => set("style", e.target.value)}>
                <option>Cinematográfico</option>
                <option>Documental</option>
                <option>Suspense</option>
                <option>Épico</option>
              </Select>
            </Field>
            <Field label="Formato">
              <Select value={channel.format} onChange={(e) => set("format", e.target.value)}>
                <option value="long-form">Long-form</option>
                <option value="short">Short</option>
              </Select>
            </Field>
          </div>
          <Button
            className="mt-5 w-full sm:w-auto"
            disabled={running || !idea.trim()}
            onClick={() => start(channel, idea)}
          >
            <Rocket size={16} /> INICIAR PRODUÇÃO
          </Button>
        </Panel>

        <div className="space-y-6">
          <Panel title="Esteira de produção">
            <Pipeline />
          </Panel>
          <Panel title="🧠 CEO da Fábrica">
            <p className="mb-3 text-sm text-muted-foreground">
              O agente responsável por coordenar a produção.
            </p>
            <dl className="space-y-2 text-sm">
              <Row label="Status">
                <Badge tone={ceo.status === "ONLINE" ? "success" : "muted"}>{ceo.status}</Badge>
              </Row>
              <Row label="Missão atual">{ceo.mission}</Row>
              <Row label="Etapa">{ceo.step}</Row>
              <Row label="Decisão">{ceo.decision}</Row>
            </dl>
          </Panel>
          {current?.quality && (
            <Panel title="Resultado">
              <p className="text-sm">
                Produção <span className="font-medium">{current.title}</span> concluída com score{" "}
                <span className="text-primary">{current.quality.overall}/100</span>. Veja Roteiros,
                Storyboards e Thumbnails no menu.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-xs text-muted-foreground uppercase">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
