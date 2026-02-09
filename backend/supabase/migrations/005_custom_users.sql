-- Create users table for custom authentication
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update profiles table to reference public.users instead of auth.users
-- We need to drop the old foreign key first
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_fkey;

-- Add new user_id column (if we want to keep profiles separate, or we can merge them?)
-- For MVP, let's just make profiles point to users.id. 
-- Actually, the user requirement didn't mention profiles, but our app uses them.
-- Let's update profiles schema to link to users.id.

ALTER TABLE public.profiles 
    ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- RLS Policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (id = current_setting('request.jwt.claim.userId', true)::uuid);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (id = current_setting('request.jwt.claim.userId', true)::uuid);

-- Note: The 'current_setting' part depends on how we set it in Postgres. 
-- Since we are doing custom auth in Node.js, we might not use Postgres RLS for custom auth users directly unless we pass the token to Supabase client.
-- But standard Supabase client uses Supabase Auth token. 
-- If we use custom auth, we will be using the SERVICE ROLE key in backend to access data on behalf of users, 
-- or we need to sign JWTs with Supabase secret if we want RLS to work?
-- Recommendation: For custom auth, backend acts as trusted middleware. RLS is less critical if all access is via API.
-- BUT, if we want to use RLS, we should sign tokens with Supabase JWT secret.

