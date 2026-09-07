import { useSyncExternalStore } from "react";
import { storageService } from "@/services/storageService";
import { basePipeline, defaultDNA, emptyChannel } from "@/data/appConfig";
import type { ChannelDNA, PipelineStep, Project, StepId } from "@/types";

export interface CeoState {
  status: "ONLINE" | "AGUARDANDO";
  mission: string;
  step: string;
  decision: string;
}

export interface FactoryState {
  projects: Project[];
  currentId: string | null;
  pipeline: PipelineStep[];
  dna: ChannelDNA;
  ceo: CeoState;
  running: boolean;
}

const initial: FactoryState = {
  projects: [],
  currentId: null,
  pipeline: basePipeline.map((s) => ({ ...s })),
  dna: defaultDNA,
  ceo: {
    status: "AGUARDANDO",
    mission: "Nenhuma produção ativa",
    step: "—",
    decision: "Aguardando nova produção.",
  },
  running: false,
};

let state: FactoryState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  storageService.set("projects", state.projects);
  storageService.set("dna", state.dna);
  storageService.set("currentId", state.currentId);
}

export function setState(patch: Partial<FactoryState>) {
  state = { ...state, ...patch };
  emit();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = {
    ...state,
    projects: storageService.get<Project[]>("projects", []),
    dna: storageService.get<ChannelDNA>("dna", defaultDNA),
    currentId: storageService.get<string | null>("currentId", null),
  };
  emit();
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getState() {
  return state;
}

export function useFactory(): FactoryState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

export function useCurrentProject(): Project | null {
  const s = useFactory();
  return s.projects.find((p) => p.id === s.currentId) ?? null;
}

export const factory = {
  createProject(idea: string, channel = emptyChannel): Project {
    const project: Project = {
      id: `p-${Date.now()}`,
      title: idea || "Nova produção",
      idea,
      channel,
      createdAt: new Date().toISOString(),
      status: "draft",
      currentStep: null,
      score: 0,
    };
    setState({ projects: [project, ...state.projects], currentId: project.id });
    persist();
    return project;
  },
  updateProject(id: string, patch: Partial<Project>) {
    setState({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
    persist();
  },
  removeProject(id: string) {
    setState({
      projects: state.projects.filter((p) => p.id !== id),
      currentId: state.currentId === id ? null : state.currentId,
    });
    persist();
  },
  duplicateProject(id: string) {
    const p = state.projects.find((x) => x.id === id);
    if (!p) return;
    const copy: Project = {
      ...p,
      id: `p-${Date.now()}`,
      title: `${p.title} (cópia)`,
      createdAt: new Date().toISOString(),
    };
    setState({ projects: [copy, ...state.projects] });
    persist();
  },
  select(id: string) {
    setState({ currentId: id });
    persist();
  },
  setDNA(dna: ChannelDNA) {
    setState({ dna });
    persist();
  },
  setStep(id: StepId, patch: Partial<PipelineStep>) {
    setState({ pipeline: state.pipeline.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  },
  resetPipeline() {
    setState({ pipeline: basePipeline.map((s) => ({ ...s })) });
  },
  setCeo(ceo: Partial<CeoState>) {
    setState({ ceo: { ...state.ceo, ...ceo } });
  },
};
