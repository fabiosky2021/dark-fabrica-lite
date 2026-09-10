import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Field, Input, Panel, Select, Textarea } from "@/components/ui-kit";
import { createProject, getProject, runStage, STAGE_ORDER } from "@/lib/factory.functions";
import { STAGES, type ProjectConfig, type ProjectRow, type StageId } from "@/types";
import { defaultConfig } from "@/data/appConfig";

export const Route = createFileRoute("/fabrica")({
  head: () => ({
    meta: [
      { title: "Fábrica V2 | Fábrica Dark IA" },
      {
        name: "description",
        content: "Pipeline real de produção de vídeos dark com agentes de IA.",
      },
    ],
  }),
  component: FabricaPage,
});

const labels: Record<StageId, string> = Object.fromEntries(
  STAGES.map((s) => [s.id, s.name]),
) as Record<StageId, string>;

function FabricaPage() {
  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);
  const [idea, setIdea] = useState("");
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [running, setRunning] = useState<StageId | "all" | null>(null);
  const [message, setMessage] = useState("");
  const update = (key: keyof ProjectConfig, value: string | number) =>
    setConfig((current) => ({ ...current, [key]: value }));

  async function refresh(id: string) {
    const data = await getProject({ data: { id } });
    setProject(data.project);
  }
  async function execute(stage: StageId) {
    if (!project) return;
    setRunning(stage);
    setMessage("");
    const result = await runStage({ data: { projectId: project.id, stage } });
    setMessage(result.ok ? result.message : (result.error ?? result.message));
    await refresh(project.id);
    setRunning(null);
  }
  async function createAndRun() {
    if (!idea.trim()) return;
    setRunning("all");
    setMessage("");
    try {
      const created = await createProject({
        data: { title: idea.trim(), theme: idea.trim(), config },
      });
      setProject(created);
      for (const stage of STAGE_ORDER) {
        const result = await runStage({ data: { projectId: created.id, stage } });
        setMessage(result.ok ? `${labels[stage]} concluída.` : (result.error ?? result.message));
        await refresh(created.id);
        if (!result.ok) break;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar a produção.");
    }
    setRunning(null);
  }
  const stageState = (stage: StageId) => project?.stages?.[stage]?.status ?? "PENDING";

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">Fábrica V2</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-balance">
          Produza vídeos dark com uma esteira real de agentes.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Cada etapa chama o agente server-side, persiste o resultado e só avança quando a geração
          foi validada.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Configuração da produção">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Ideia do vídeo">
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="O último dia antes do Dilúvio"
                />
              </Field>
            </div>
            <Field label="Canal">
              <Input
                value={config.channel}
                onChange={(e) => update("channel", e.target.value)}
                placeholder="Filmes Bíblicos Épicos"
              />
            </Field>
            <Field label="Nicho">
              <Input
                value={config.niche}
                onChange={(e) => update("niche", e.target.value)}
                placeholder="Narrativas históricas"
              />
            </Field>
            <Field label="Idioma">
              <Select value={config.language} onChange={(e) => update("language", e.target.value)}>
                <option value="pt-BR">Português Brasileiro</option>
                <option value="en-US">Inglês</option>
                <option value="es-ES">Espanhol</option>
              </Select>
            </Field>
            <Field label="Duração">
              <Select
                value={String(config.durationMinutes)}
                onChange={(e) => update("durationMinutes", Number(e.target.value))}
              >
                <option value="10">10 minutos</option>
                <option value="20">20 minutos</option>
                <option value="30">30 minutos</option>
              </Select>
            </Field>
            <Field label="Duração das cenas">
              <Select
                value={String(config.sceneSeconds)}
                onChange={(e) => update("sceneSeconds", Number(e.target.value))}
              >
                <option value="5">5 segundos</option>
                <option value="8">8 segundos</option>
                <option value="10">10 segundos</option>
              </Select>
            </Field>
            <Field label="Estilo visual">
              <Input value={config.style} onChange={(e) => update("style", e.target.value)} />
            </Field>
            <Field label="Público">
              <Input value={config.audience} onChange={(e) => update("audience", e.target.value)} />
            </Field>
            <Field label="Voz">
              <Select value={config.voice} onChange={(e) => update("voice", e.target.value)}>
                <option value="onyx">Onyx — grave</option>
                <option value="alloy">Alloy — neutra</option>
                <option value="nova">Nova — narrativa</option>
              </Select>
            </Field>
            <Field label="Proporção">
              <Input value="16:9" readOnly />
            </Field>
          </div>
          <Button
            className="mt-5 w-full sm:w-auto"
            disabled={running !== null || !idea.trim()}
            onClick={() => void createAndRun()}
          >
            <Play className="size-4" /> CRIAR VÍDEO COMPLETO
          </Button>
          {message && (
            <p className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-sm text-muted-foreground">
              {message}
            </p>
          )}
        </Panel>
        <Panel title="Timeline de produção">
          <ol className="space-y-2">
            {STAGE_ORDER.map((stage, index) => {
              const status = stageState(stage);
              return (
                <li
                  key={stage}
                  className="flex items-center gap-3 rounded-md border border-border/60 bg-surface-2 p-3"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">{labels[stage]}</span>
                  <Badge
                    tone={
                      status === "COMPLETED"
                        ? "success"
                        : status === "FAILED"
                          ? "danger"
                          : status === "RUNNING"
                            ? "warning"
                            : "muted"
                    }
                  >
                    {status}
                  </Badge>
                  <Button
                    variant="ghost"
                    disabled={!project || running !== null}
                    onClick={() => void execute(stage)}
                    aria-label={`Executar ${labels[stage]}`}
                  >
                    {status === "FAILED" ? (
                      <RotateCcw className="size-4" />
                    ) : status === "RUNNING" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                </li>
              );
            })}
          </ol>
          {project?.status === "PRONTO" && (
            <p className="mt-4 text-sm font-medium text-success">
              Projeto final liberado após o controle de qualidade.
            </p>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
