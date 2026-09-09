CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Novo projeto',
  theme TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  stages JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'IDEIA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  idx INTEGER NOT NULL DEFAULT 0,
  start_s NUMERIC NOT NULL DEFAULT 0,
  end_s NUMERIC NOT NULL DEFAULT 0,
  duration_s NUMERIC NOT NULL DEFAULT 5,
  narration TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  characters TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL DEFAULT '',
  camera TEXT NOT NULL DEFAULT '',
  movement TEXT NOT NULL DEFAULT '',
  lighting TEXT NOT NULL DEFAULT '',
  atmosphere TEXT NOT NULL DEFAULT '',
  effects TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  negative_prompt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'completed',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  attempt INTEGER NOT NULL DEFAULT 1,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user ON public.projects(user_id, created_at DESC);
CREATE INDEX idx_scenes_project ON public.scenes(project_id, idx);
CREATE INDEX idx_assets_project ON public.assets(project_id, created_at DESC);
CREATE INDEX idx_agent_runs_project ON public.agent_runs(project_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenes TO authenticated;
GRANT ALL ON public.scenes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own projects" ON public.projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own scenes" ON public.scenes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assets" ON public.assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own agent runs" ON public.agent_runs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER scenes_updated_at BEFORE UPDATE ON public.scenes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "owner read media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "owner upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "owner update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "owner delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text);