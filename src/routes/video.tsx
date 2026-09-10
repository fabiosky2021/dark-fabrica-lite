import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Clapperboard, Download, LockKeyhole, Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Panel, ScoreBar } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { useCurrentProject } from "@/hooks/useFactory";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "Gerador de vídeo | Fábrica Dark IA" },
      {
        name: "description",
        content: "Workspace de montagem e exportação do vídeo final.",
      },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const project = useCurrentProject();
  const quality = project?.quality;
  const approved = Boolean(quality?.approved);

  if (!project) {
    return (
      <AppShell>
        <EmptyState title="Selecione uma produção para montar o vídeo" />
        <div className="mt-4 text-center">
          <Link to="/fabrica" className="text-sm text-primary hover:underline">
            Criar uma produção
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
            Workspace de vídeo
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-balance">{project.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Revise cenas, narração e qualidade antes de exportar. Nenhum vídeo é marcado como pronto
            sem um arquivo real.
          </p>
        </div>
        <Badge tone={approved ? "success" : "warning"}>
          {approved ? "QC aprovado" : "QC pendente"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Timeline de montagem">
          <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-border bg-surface-2 p-6 text-center">
            <div>
              <Clapperboard className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Renderizador de vídeo não conectado</p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                O projeto e todos os artefatos continuam salvos. Conecte um provedor de renderização
                para montar o MP4 final; não vamos gerar um preview falso.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-border bg-surface-2 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Próximo passo recomendado</p>
            <p className="mt-1">
              Execute as etapas pendentes na Fábrica. O exportador só será liberado depois de um QC
              aprovado e de assets reais salvos no storage privado.
            </p>
            <Link to="/fabrica" className="mt-3 inline-flex text-primary hover:underline">
              Abrir pipeline da Fábrica
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled title="Disponível quando um renderizador estiver conectado">
              <Play className="size-4" /> Iniciar renderização
            </Button>
            <Button variant="outline" disabled title="Nenhum arquivo final disponível">
              <Download className="size-4" /> Baixar MP4
            </Button>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Pré-requisitos">
            <div className="space-y-3 text-sm">
              <Requirement label="Roteiro" done={project.stages.script?.status === "COMPLETED"} />
              <Requirement
                label="Cenas e prompts"
                done={project.stages.prompts?.status === "COMPLETED"}
              />
              <Requirement
                label="Narração"
                done={project.stages.narration?.status === "COMPLETED"}
              />
              <Requirement label="Visuais" done={project.stages.visuals?.status === "COMPLETED"} />
              <Requirement label="Controle de qualidade" done={approved} />
            </div>
          </Panel>
          <Panel title="Qualidade">
            {quality ? (
              <ScoreBar label="Pontuação geral" value={quality.overall} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Execute a etapa de qualidade para liberar a exportação.
              </p>
            )}
            {!approved && (
              <div className="mt-4 flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>
                  Exportação bloqueada até o QC aprovar o projeto e o renderizador estar
                  configurado.
                </span>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Requirement({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      {done ? (
        <Badge tone="success">Pronto</Badge>
      ) : (
        <Badge tone="muted">
          <LockKeyhole className="size-3" /> Pendente
        </Badge>
      )}
    </div>
  );
}
