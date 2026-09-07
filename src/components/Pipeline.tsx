import { Check, Loader2, Circle, AlertTriangle } from "lucide-react";
import { useFactory } from "@/hooks/useFactory";

export function Pipeline() {
  const { pipeline } = useFactory();
  return (
    <ol className="space-y-2">
      {pipeline.map((s) => (
        <li
          key={s.id}
          className="flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5"
        >
          <span className="shrink-0">
            {s.status === "completed" && <Check size={16} className="text-success" />}
            {s.status === "processing" && <Loader2 size={16} className="animate-spin text-primary" />}
            {s.status === "idle" && <Circle size={16} className="text-muted-foreground" />}
            {s.status === "error" && <AlertTriangle size={16} className="text-destructive" />}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
          <span className="hidden h-1 w-28 overflow-hidden rounded-full bg-secondary sm:block">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${s.progress}%` }}
            />
          </span>
          <span className="w-20 text-right text-[11px] text-muted-foreground uppercase">
            {s.status}
          </span>
        </li>
      ))}
    </ol>
  );
}
