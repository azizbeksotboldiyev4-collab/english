
-- Vocabulary lessons table
CREATE TABLE public.vocab_lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_uz TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  lesson_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vocabulary words table
CREATE TABLE public.vocab_words (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES public.vocab_lessons(id) ON DELETE CASCADE,
  en TEXT NOT NULL,
  uz TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📝',
  word_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.vocab_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_words ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth needed for reading vocabulary content)
CREATE POLICY "Anyone can read vocab lessons"
ON public.vocab_lessons FOR SELECT
USING (true);

CREATE POLICY "Anyone can read vocab words"
ON public.vocab_words FOR SELECT
USING (true);

-- Create index for performance
CREATE INDEX idx_vocab_words_lesson_id ON public.vocab_words(lesson_id);
CREATE INDEX idx_vocab_lessons_order ON public.vocab_lessons(lesson_order);
