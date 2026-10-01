-- Restrict listening exercise reads to authenticated users so correct answers
-- are not publicly available to anonymous visitors.
DROP POLICY IF EXISTS "Anyone can read listening exercises" ON public.listening_exercises;

CREATE POLICY "Authenticated users can read listening exercises"
ON public.listening_exercises
FOR SELECT
TO authenticated
USING (true);