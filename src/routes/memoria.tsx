import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, Button, Field, Input, Textarea, Badge } from "@/components/ui-kit";
import { factory, useFactory } from "@/hooks/useFactory";
import { defaultDNA } from "@/data/appConfig";
import type { ChannelDNA } from "@/types";

export const Route = createFileRoute("/memoria")({
  head: () => ({
    meta: [
      { title: "Memória — DNA do Canal | Fábrica Dark IA" },
      {
        name: "description",
        content: "Defina o DNA do canal: tom, estilo visual, voz, público e regras.",
      },
      { property: "og:title", content: "Memória — DNA do Canal" },
      { property: "og:description", content: "A memória permanente que orienta todos os agentes." },
    ],
  }),
  component: MemoriaPage,
});

const CAMPOS: { key: keyof ChannelDNA; label: string; long?: boolean }[] = [
  { key: "niche", label: "Nicho" },
  { key: "tone", label: "Tom da narração" },
  { key: "visualStyle", label: "Estilo visual", long: true },
  { key: "defaultDuration", label: "Duração padrão" },
  { key: "hookType", label: "Tipo de hook" },
  { key: "thumbnailStyle", label: "Estilo de thumbnail", long: true },
  { key: "titleType", label: "Tipo de título" },
  { key: "voice", label: "Voz" },
  { key: "audience", label: "Público-alvo", long: true },
  { key: "rules", label: "Regras do canal", long: true },
];

function MemoriaPage() {
  const { dna } = useFactory();
  const [draft, setDraft] = useState<ChannelDNA>(dna);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(dna), [dna]);

  const set = (k: keyof ChannelDNA, v: string) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Memória — DNA do Canal</h1>
          <p className="text-sm text-muted-foreground">
            Salvo neste navegador e usado como contexto pelos agentes.
          </p>
        </div>
        {saved && <Badge tone="success">Alterações salvas</Badge>}
      </div>

      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          {CAMPOS.map(({ key, label, long }) => (
            <div key={key} className={long ? "sm:col-span-2" : undefined}>
              <Field label={label}>
                {long ? (
                  <Textarea value={draft[key]} onChange={(e) => set(key, e.target.value)} />
                ) : (
                  <Input value={draft[key]} onChange={(e) => set(key, e.target.value)} />
                )}
              </Field>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              factory.setDNA(draft);
              setSaved(true);
            }}
          >
            <Save size={16} /> Salvar DNA
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              factory.setDNA(defaultDNA);
              setDraft(defaultDNA);
              setSaved(true);
            }}
          >
            <RotateCcw size={16} /> Restaurar padrão
          </Button>
        </div>
      </Panel>
    </AppShell>
  );
}
