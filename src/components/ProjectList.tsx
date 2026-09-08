import { useNavigate } from "@tanstack/react-router";
import { Copy, Trash2, FolderOpen } from "lucide-react";
import { Panel, Badge, Button } from "@/components/ui-kit";
import { factory } from "@/hooks/useFactory";
import type { Project } from "@/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <Panel key={p.id} className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium">{p.title}</p>
              <Badge
                tone={p.status === "done" ? "success" : p.status === "producing" ? "warning" : "muted"}
              >
                {p.status === "done" ? "Concluído" : p.status === "producing" ? "Produzindo" : "Rascunho"}
              </Badge>
              {p.score > 0 && <Badge tone="primary">Score {p.score}</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {p.channel.niche || "Sem nicho"} · {new Date(p.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                factory.select(p.id);
                void navigate({ to: "/roteiros" });
              }}
            >
              <FolderOpen size={15} /> Abrir
            </Button>
            <Button variant="ghost" aria-label="Duplicar" onClick={() => factory.duplicateProject(p.id)}>
              <Copy size={15} /> Duplicar
            </Button>
            <Button variant="ghost" aria-label="Excluir" onClick={() => factory.removeProject(p.id)}>
              <Trash2 size={15} /> Excluir
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}
