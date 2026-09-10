import { Link } from "@tanstack/react-router";
import { ArrowRight, Trash2 } from "lucide-react";
import { Badge, Button, Panel } from "@/components/ui-kit";
import { factory } from "@/hooks/useFactory";
import type { Project } from "@/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Panel key={project.id} className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{project.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <Badge
            tone={
              project.status === "done"
                ? "success"
                : project.status === "error"
                  ? "danger"
                  : project.status === "producing"
                    ? "warning"
                    : "muted"
            }
          >
            {project.status}
          </Badge>
          <Link to="/fabrica">
            <Button
              variant="ghost"
              onClick={() => factory.select(project.id)}
              aria-label={`Abrir ${project.title}`}
            >
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => factory.removeProject(project.id)}
            aria-label={`Excluir ${project.title}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </Panel>
      ))}
    </div>
  );
}
