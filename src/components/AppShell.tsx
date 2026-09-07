import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Factory,
  Lightbulb,
  PenLine,
  Clapperboard,
  Image as ImageIcon,
  BarChart3,
  Bot,
  Brain,
  Settings,
  Menu,
  X,
  Rocket,
  FolderClock,
} from "lucide-react";
import { appConfig } from "@/data/appConfig";
import { useFactory } from "@/hooks/useFactory";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/fabrica", label: "Fábrica", icon: Factory },
  { to: "/ideias", label: "Ideias", icon: Lightbulb },
  { to: "/roteiros", label: "Roteiros", icon: PenLine },
  { to: "/storyboards", label: "Storyboards", icon: Clapperboard },
  { to: "/thumbnails", label: "Thumbnails", icon: ImageIcon },
  { to: "/producoes", label: "Produções", icon: FolderClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/agentes", label: "Agentes", icon: Bot },
  { to: "/memoria", label: "Memória", icon: Brain },
  { to: "/roadmap", label: "Roadmap", icon: Rocket },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { running } = useFactory();

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface p-4 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-bold tracking-wide">🏭 FÁBRICA DARK IA</p>
            <p className="text-[11px] text-muted-foreground">v{appConfig.app.version} · lite</p>
          </div>
          <button
            aria-label="Fechar menu"
            className="text-muted-foreground lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/12 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            aria-label="Abrir menu"
            className="text-muted-foreground lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-display text-sm font-semibold tracking-wide sm:text-base">
            FÁBRICA DARK IA
          </h1>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${running ? "bg-warning" : "bg-success"}`}
              aria-hidden
            />
            {running ? "Produzindo…" : "Sistema pronto"}
          </span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
