
CREATE TABLE public.custom_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id text NOT NULL DEFAULT 'a1',
  category text NOT NULL DEFAULT 'grammar',
  title text NOT NULL,
  title_uz text NOT NULL,
  description text NOT NULL DEFAULT '',
  explanation text NOT NULL DEFAULT '',
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  real_life jsonb NOT NULL DEFAULT '[]'::jsonb,
  practice jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  video_title text,
  is_locked boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom lessons" ON public.custom_lessons FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert custom lessons" ON public.custom_lessons FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update custom lessons" ON public.custom_lessons FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete custom lessons" ON public.custom_lessons FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
