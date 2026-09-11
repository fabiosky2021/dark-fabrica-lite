import { Check, Circle, Loader2, X } from "lucide-react";
import { useFactory } from "@/hooks/useFactory";

export function Pipeline() {
  const { pipeline } = useFactory();
  return (
    <ol className="space-y-2">
      {pipeline.map((step, index) => (
        <li
          key={step.id}
          className="flex items-center gap-3 rounded-md border border-border/60 bg-surface-2 px-3 py-2 text-sm"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] text-muted-foreground">
            {index + 1}
          </span>
          {step.status === "done" ? (
            <Check className="size-4 text-success" />
          ) : step.status === "running" ? (
            <Loader2 className="size-4 animate-spin text-warning" />
          ) : step.status === "error" ? (
            <X className="size-4 text-destructive" />
          ) : (
            <Circle className="size-4 text-muted-foreground" />
          )}
          <span className="flex-1">{step.label}</span>
          <span className="text-[10px] font-medium uppercase text-muted-foreground">
            {step.status}
          </span>
        </li>
      ))}
    </ol>
  );
}
