import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Download, ExternalLink, RefreshCw, Save, Trash2, Wifi } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, Button, Field, Select, Badge } from "@/components/ui-kit";
import { storageService } from "@/services/storageService";
import { appConfig } from "@/data/appConfig";
import { useFactory } from "@/hooks/useFactory";
import {
  freeModels,
  getProviders,
  maskSecret,
  routingAgents,
  saveProviders,
  testProvider,
  type AIProviderConfig,
} from "@/services/providerRegistry";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Fábrica Dark IA" },
      { name: "description", content: "Preferências, provedores e roteamento de IA." },
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
const tabs = ["Gateway", "Provedores", "Modelos", "Fallback", "Imagem", "Voz", "Vídeo", "Logs"];

function ConfiguracoesPage() {
  const { projects, dna } = useFactory();
  const [tab, setTab] = useState("Gateway");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<
    Record<string, { ok: boolean; message: string; latencyMs: number }>
  >({});

  useEffect(() => {
    setPrefs(storageService.get<Prefs>("prefs", DEFAULTS));
    setProviders(getProviders());
  }, []);
  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    storageService.set("prefs", next);
    setSaved(true);
  };
  const updateProvider = (id: string, patch: Partial<AIProviderConfig>) =>
    setProviders((current) =>
      current.map((provider) => (provider.id === id ? { ...provider, ...patch } : provider)),
    );
  const test = async (provider: AIProviderConfig) => {
    setTesting(provider.id);
    const result = await testProvider(provider);
    setResults((current) => ({ ...current, [provider.id]: result }));
    setTesting(null);
  };
  const persistProviders = () => {
    saveProviders(providers);
    setSaved(true);
  };
  const exportar = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { projects, dna, prefs, providers: providers.map(({ ...provider }) => provider) },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
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
            Controle o gateway, provedores e regras do pipeline.
          </p>
        </div>
        {saved && (
          <Badge tone="success">
            <Check size={14} /> Alterações salvas
          </Badge>
        )}
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-2">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Provedores" || tab === "Gateway" ? (
        <div className="space-y-6">
          <Panel title="Provedores ativos">
            <div className="space-y-4">
              {providers.map((provider) => {
                const result = results[provider.id];
                return (
                  <div
                    key={provider.id}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {provider.name}{" "}
                          {provider.freeTier && <Badge tone="warning">gratuito</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{provider.baseUrl}</p>
                      </div>
                      <Badge
                        tone={
                          result?.ok || provider.status === "configured" ? "success" : "warning"
                        }
                      >
                        {result?.ok
                          ? "online"
                          : provider.status === "configured"
                            ? "configurado"
                            : "precisa configurar"}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Field label="Endpoint OpenAI-compatible">
                        <input
                          value={provider.baseUrl}
                          onChange={(event) =>
                            updateProvider(provider.id, { baseUrl: event.target.value })
                          }
                        />
                      </Field>
                      <Field label="Modelo padrão">
                        <input
                          value={provider.model}
                          onChange={(event) =>
                            updateProvider(provider.id, { model: event.target.value })
                          }
                        />
                      </Field>
                      <Field label="Prioridade">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={provider.priority}
                          onChange={(event) =>
                            updateProvider(provider.id, { priority: Number(event.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Timeout (ms)">
                        <input
                          type="number"
                          min="1000"
                          value={provider.timeoutMs}
                          onChange={(event) =>
                            updateProvider(provider.id, { timeoutMs: Number(event.target.value) })
                          }
                        />
                      </Field>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => test(provider)}
                        disabled={testing === provider.id}
                      >
                        {testing === provider.id ? (
                          <RefreshCw className="animate-spin" size={16} />
                        ) : (
                          <Wifi size={16} />
                        )}{" "}
                        Testar conexão
                      </Button>
                      <Button onClick={persistProviders}>
                        <Save size={16} /> Salvar provedor
                      </Button>
                      {result && (
                        <span
                          className={`text-xs ${result.ok ? "text-success" : "text-destructive"}`}
                        >
                          {result.ok
                            ? `${result.latencyMs} ms · ${result.message}`
                            : `${result.message} (${result.latencyMs} ms)`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="Nota sobre o 9Router">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <ExternalLink className="mt-0.5 shrink-0 text-primary" size={18} />
              <p>
                O 9Router pode funcionar como endpoint OpenAI-compatible local. Ele precisa estar
                rodando na sua máquina e acessível pelo ambiente onde a aplicação executa; não é um
                provedor gratuito garantido nem deve receber chaves em logs.{" "}
                <a
                  className="text-primary underline"
                  href="https://github.com/decolua/9router"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver documentação do 9Router
                </a>
              </p>
            </div>
          </Panel>
        </div>
      ) : tab === "Modelos" ? (
        <Panel title="Catálogo de modelos gratuitos">
          <div className="grid gap-3 md:grid-cols-3">
            {freeModels.map((model) => (
              <div
                key={`${model.provider}-${model.model}`}
                className="rounded-lg border border-border p-4"
              >
                <Badge tone="success">disponível conforme provedor</Badge>
                <h2 className="mt-3 font-medium">{model.model}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {model.provider} · {model.detail}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      ) : tab === "Fallback" ? (
        <Panel title="Roteamento por agente">
          <p className="mb-4 text-sm text-muted-foreground">
            Defina uma rota primária e uma alternativa. O fallback só acontece em timeout, HTTP 429
            ou erro 5xx.
          </p>
          <div className="space-y-3">
            {routingAgents.map((agent) => (
              <div
                key={agent}
                className="grid items-center gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_1fr]"
              >
                <span className="font-medium">{agent}</span>
                <Select defaultValue="vercel-gateway">
                  <option value="vercel-gateway">Vercel AI Gateway</option>
                  <option value="9router">9Router</option>
                </Select>
                <Select defaultValue="9router">
                  <option value="9router">9Router</option>
                  <option value="vercel-gateway">Vercel AI Gateway</option>
                </Select>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
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
              <Field label="Densidade">
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
      )}
    </AppShell>
  );
}
