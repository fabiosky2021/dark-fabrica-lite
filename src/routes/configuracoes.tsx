import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, Button, Field, Select, Badge } from "@/components/ui-kit";
import { storageService } from "@/services/storageService";
import { appConfig } from "@/data/appConfig";
import { useFactory } from "@/hooks/useFactory";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Fábrica Dark IA" },
      {
        name: "description",
        content: "Preferências da aplicação, dados salvos e exportação de projetos.",
      },
      { property: "og:title", content: "Configurações | Fábrica Dark IA" },
      {
        property: "og:description",
        content: "Ajuste animações, salvamento automático e gerencie seus dados.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

interface Prefs {
  animations: boolean;
  autoSave: boolean;
  density: "confortavel" | "compacto";
}

const DEFAULTS: Prefs = { animations: true, autoSave: true, density: "confortavel" };

function ConfiguracoesPage() {
  const { projects, dna } = useFactory();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(storageService.get<Prefs>("prefs", DEFAULTS));
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    storageService.set("prefs", next);
    setSaved(true);
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify({ projects, dna, prefs }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fabrica-dark-ia.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            {appConfig.app.name} · versão {appConfig.app.version} · modo {appConfig.app.mode}
          </p>
        </div>
        {saved && <Badge tone="success">Preferências salvas</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Preferências">
          <div className="space-y-4">
            <Field label="Animações">
              <Select
                value={prefs.animations ? "on" : "off"}
                onChange={(e) => update({ animations: e.target.value === "on" })}
              >
                <option value="on">Ativadas</option>
                <option value="off">Desativadas</option>
              </Select>
            </Field>
            <Field label="Salvamento automático">
              <Select
                value={prefs.autoSave ? "on" : "off"}
                onChange={(e) => update({ autoSave: e.target.value === "on" })}
              >
                <option value="on">Ativado</option>
                <option value="off">Desativado</option>
              </Select>
            </Field>
            <Field label="Densidade da interface">
              <Select
                value={prefs.density}
                onChange={(e) => update({ density: e.target.value as Prefs["density"] })}
              >
                <option value="confortavel">Confortável</option>
                <option value="compacto">Compacto</option>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Dados">
          <p className="text-sm text-muted-foreground">
            {projects.length} produção(ões) e o DNA do canal estão salvos neste navegador.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportar}>
              <Download size={16} /> Exportar dados
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Apagar todos os dados salvos neste navegador?")) {
                  storageService.clear();
                  window.location.reload();
                }
              }}
            >
              <Trash2 size={16} /> Apagar tudo
            </Button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
