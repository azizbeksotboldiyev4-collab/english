
ALTER TABLE public.profiles 
ADD COLUMN is_premium boolean NOT NULL DEFAULT false,
ADD COLUMN premium_plan text DEFAULT NULL;
