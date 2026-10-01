
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_progress (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Public table policies
DROP POLICY IF EXISTS "Admins can insert listening exercises" ON public.listening_exercises;
DROP POLICY IF EXISTS "Admins can update listening exercises" ON public.listening_exercises;
DROP POLICY IF EXISTS "Admins can delete listening exercises" ON public.listening_exercises;
DROP POLICY IF EXISTS "Authenticated users can read listening exercises" ON public.listening_exercises;
DROP POLICY IF EXISTS "Anyone can read listening exercises" ON public.listening_exercises;

CREATE POLICY "Admins can insert listening exercises" ON public.listening_exercises
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update listening exercises" ON public.listening_exercises
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete listening exercises" ON public.listening_exercises
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Authenticated can read listening exercises" ON public.listening_exercises
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert speaking exercises" ON public.speaking_exercises;
DROP POLICY IF EXISTS "Admins can update speaking exercises" ON public.speaking_exercises;
DROP POLICY IF EXISTS "Admins can delete speaking exercises" ON public.speaking_exercises;
CREATE POLICY "Admins can insert speaking exercises" ON public.speaking_exercises
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update speaking exercises" ON public.speaking_exercises
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete speaking exercises" ON public.speaking_exercises
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert vocabulary items" ON public.vocabulary_items;
DROP POLICY IF EXISTS "Admins can update vocabulary items" ON public.vocabulary_items;
DROP POLICY IF EXISTS "Admins can delete vocabulary items" ON public.vocabulary_items;
CREATE POLICY "Admins can insert vocabulary items" ON public.vocabulary_items
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update vocabulary items" ON public.vocabulary_items
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete vocabulary items" ON public.vocabulary_items
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Admins can update custom lessons" ON public.custom_lessons;
DROP POLICY IF EXISTS "Admins can delete custom lessons" ON public.custom_lessons;
CREATE POLICY "Admins can insert custom lessons" ON public.custom_lessons
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update custom lessons" ON public.custom_lessons
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete custom lessons" ON public.custom_lessons
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Storage policies referencing old public.has_role
DROP POLICY IF EXISTS "Admins can upload lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can replace lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete lesson videos" ON storage.objects;
CREATE POLICY "Admins can upload lesson videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-videos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can replace lesson videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-videos' AND private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'lesson-videos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete lesson videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-videos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop old public functions now that nothing references them
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Safe public view of listening_exercises (no correct_answer)
DROP VIEW IF EXISTS public.listening_exercises_public;
CREATE VIEW public.listening_exercises_public
WITH (security_invoker = true) AS
SELECT id, title, audio_text, question, options, level, created_by, created_at, updated_at
FROM public.listening_exercises;
GRANT SELECT ON public.listening_exercises_public TO authenticated;

-- Server-side answer checker
CREATE OR REPLACE FUNCTION public.check_listening_answer(exercise_id uuid, user_answer text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listening_exercises
    WHERE id = exercise_id AND lower(trim(correct_answer)) = lower(trim(user_answer))
  );
$$;
REVOKE ALL ON FUNCTION public.check_listening_answer(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_listening_answer(uuid, text) TO authenticated;
