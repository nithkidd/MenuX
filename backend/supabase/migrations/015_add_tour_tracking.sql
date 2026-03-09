-- Add tour tracking fields to profiles table
-- This migration adds fields to track user onboarding progress and completed tours

-- Add onboarding_completed field (boolean to track if user has completed all onboarding)
ALTER TABLE profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Add tours_completed field (JSONB array to store IDs of completed tours)
-- Format: ["dashboard-first-visit", "business-create", "business-overview", "menu-editor", "item-create"]
ALTER TABLE profiles 
ADD COLUMN tours_completed JSONB DEFAULT '[]'::jsonb;

-- Add index for faster queries on onboarding status
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indicates whether the user has completed all onboarding tours';
COMMENT ON COLUMN profiles.tours_completed IS 'JSONB array storing IDs of completed tour steps (e.g., ["dashboard-first-visit", "business-create"])';
