-- Add role column to profiles table for RBAC
-- Roles: user (default), admin, super_admin

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role for RBAC: user, admin, or super_admin';
