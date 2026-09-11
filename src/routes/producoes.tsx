import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Panel, Select, Input } from "@/components/ui-kit";
import { ProjectList } from "@/components/ProjectList";
import { EmptyState } from "@/components/EmptyState";
import { useFactory } from "@/hooks/useFactory";

export const Route = createFileRoute("/producoes")({
  head: () => ({
    meta: [
      { title: "Produções anteriores | Fábrica Dark IA" },
      {
        name: "description",
        content: "Histórico de produções: abrir, duplicar e excluir projetos.",
      },
      { property: "og:title", content: "Produções anteriores" },
      {
        property: "og:description",
        content: "Todo o histórico das suas produções em um só lugar.",
      },
    ],
  }),
  component: ProducoesPage,
});

function ProducoesPage() {
  const { projects } = useFactory();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const filtered = projects.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      p.title.toLowerCase().includes(q.toLowerCase().trim()),
  );

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Produções anteriores</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} projeto(s) salvos neste navegador.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Nenhuma produção no histórico" />
      ) : (
        <>
          <Panel className="mb-5">
            <div className="flex flex-wrap gap-2">
              <Input
                className="min-w-52 flex-1"
                placeholder="Buscar por título…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select className="w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">Todos os status</option>
                <option value="draft">Rascunho</option>
                <option value="producing">Produzindo</option>
                <option value="done">Concluído</option>
              </Select>
            </div>
          </Panel>
          {filtered.length === 0 ? (
            <Panel>
              <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
            </Panel>
          ) : (
            <ProjectList projects={filtered} />
          )}
        </>
      )}
    </AppShell>
  );
}
