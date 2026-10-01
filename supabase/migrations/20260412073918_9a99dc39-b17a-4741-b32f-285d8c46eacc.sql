
-- Video Lessons table
CREATE TABLE public.video_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  level text NOT NULL DEFAULT 'beginner',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read video lessons" ON public.video_lessons FOR SELECT USING (true);
CREATE POLICY "Admins can insert video lessons" ON public.video_lessons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update video lessons" ON public.video_lessons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete video lessons" ON public.video_lessons FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_video_lessons_updated_at BEFORE UPDATE ON public.video_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Listening Exercises table
CREATE TABLE public.listening_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  audio_text text NOT NULL,
  question text,
  options text[] DEFAULT '{}',
  correct_answer text,
  level text NOT NULL DEFAULT 'a1',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.listening_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read listening exercises" ON public.listening_exercises FOR SELECT USING (true);
CREATE POLICY "Admins can insert listening exercises" ON public.listening_exercises FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update listening exercises" ON public.listening_exercises FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete listening exercises" ON public.listening_exercises FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_listening_exercises_updated_at BEFORE UPDATE ON public.listening_exercises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Speaking Exercises table
CREATE TABLE public.speaking_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  text text NOT NULL,
  translation text,
  level text NOT NULL DEFAULT 'a1',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.speaking_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read speaking exercises" ON public.speaking_exercises FOR SELECT USING (true);
CREATE POLICY "Admins can insert speaking exercises" ON public.speaking_exercises FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update speaking exercises" ON public.speaking_exercises FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete speaking exercises" ON public.speaking_exercises FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_speaking_exercises_updated_at BEFORE UPDATE ON public.speaking_exercises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vocabulary Items table
CREATE TABLE public.vocabulary_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word text NOT NULL,
  translation text NOT NULL,
  example text,
  level text NOT NULL DEFAULT 'a1',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vocabulary items" ON public.vocabulary_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert vocabulary items" ON public.vocabulary_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vocabulary items" ON public.vocabulary_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vocabulary items" ON public.vocabulary_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vocabulary_items_updated_at BEFORE UPDATE ON public.vocabulary_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
