-- ==================================================================================
-- Helper function to easily set user roles by email
-- Usage: SELECT set_user_role('user@example.com', 'admin');
-- ==================================================================================

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION public.set_user_role(
  target_email TEXT, 
  new_role TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  user_email TEXT,
  assigned_role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Run as database owner to bypass RLS if needed (admin tool)
AS $$
DECLARE
  target_profile_id UUID;
  current_user_role TEXT;
BEGIN
  -- Validate role
  IF new_role NOT IN ('user', 'admin', 'super_admin') THEN
    RETURN QUERY SELECT false, 'Invalid role. Must be: user, admin, super_admin', target_email, NULL;
    RETURN;
  END IF;

  -- Find profile
  SELECT id, role INTO target_profile_id, current_user_role
  FROM public.profiles
  WHERE email = target_email;

  IF target_profile_id IS NULL THEN
    -- Try to find in auth.users and create profile? 
    -- For safety, let's strictly require a profile to exist first.
    -- (Or we could look up auth.users, but accessing auth schema from public function requires permissions)
    RETURN QUERY SELECT false, 'User profile not found. User must sign in at least once.', target_email, NULL;
    RETURN;
  END IF;

  -- Update role
  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_profile_id;

  RETURN QUERY SELECT true, 'Role updated successfully', target_email, new_role;
END;
$$;

-- ==================================================================================
-- 2. EXAMPLE USAGE
-- Uncomment and run the lines below to set roles:
-- ==================================================================================

-- SELECT * FROM set_user_role('admin@example.com', 'admin');
-- SELECT * FROM set_user_role('super@example.com', 'super_admin');
-- SELECT * FROM set_user_role('user@example.com', 'user');

-- Check results
-- SELECT email, role FROM public.profiles WHERE email IN ('admin@example.com', 'super@example.com');
