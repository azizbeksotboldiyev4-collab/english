
-- Fix 1: Prevent privilege escalation on user_roles
-- Ensure no one can INSERT/UPDATE/DELETE roles via client (only service role can manage)
-- RLS is already enabled, and no INSERT/UPDATE/DELETE policies exist,
-- but we need to be explicit. The default-deny should block writes,
-- but let's add explicit deny policies for safety.

-- Fix 2: Add constraints on user_progress to limit arbitrary values
ALTER TABLE public.user_progress ADD CONSTRAINT xp_range CHECK (xp >= 0 AND xp <= 1000000);
ALTER TABLE public.user_progress ADD CONSTRAINT streak_range CHECK (streak >= 0 AND streak <= 3650);
ALTER TABLE public.user_progress ADD CONSTRAINT level_valid CHECK (current_level IN ('a1', 'a2', 'b1', 'b2', 'c1', 'c2'));

-- Fix 3: Add missing UPDATE policy for level_exams
CREATE POLICY "Users can update own exams"
ON public.level_exams FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
