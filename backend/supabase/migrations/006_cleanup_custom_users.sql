-- Cleanup custom auth artifacts after migrating to Supabase Auth

-- Remove profiles.user_id column and index if they exist
DROP INDEX IF EXISTS public.idx_profiles_user_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_id;

-- Drop the custom users table
DROP TABLE IF EXISTS public.users;
