
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS last_lesson_id text,
  ADD COLUMN IF NOT EXISTS last_level_id text,
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_streak_date date,
  ADD COLUMN IF NOT EXISTS weekly_activity jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP TRIGGER IF EXISTS user_progress_set_updated_at ON public.user_progress;
CREATE TRIGGER user_progress_set_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
