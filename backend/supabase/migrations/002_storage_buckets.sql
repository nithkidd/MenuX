-- Supabase Storage Buckets Setup
-- Run these commands in Supabase SQL Editor or use the Dashboard

-- Note: Storage buckets are typically created via Supabase Dashboard
-- Go to Storage > Create a new bucket

-- Buckets to create:
-- 1. "logos" - For business logos
-- 2. "menu-images" - For menu item images
-- 3. "avatars" - For user profile pictures

-- After creating buckets, add these storage policies:

-- Logos bucket policies
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES 
  ('Authenticated users can upload logos', 'logos', 'INSERT', 
   'bucket_id = ''logos'' AND auth.role() = ''authenticated'''),
  ('Public can view logos', 'logos', 'SELECT', 
   'bucket_id = ''logos'''),
  ('Users can update own logos', 'logos', 'UPDATE', 
   'bucket_id = ''logos'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('Users can delete own logos', 'logos', 'DELETE', 
   'bucket_id = ''logos'' AND auth.uid()::text = (storage.foldername(name))[1]');

-- Menu images bucket policies
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES 
  ('Authenticated users can upload menu images', 'menu-images', 'INSERT', 
   'bucket_id = ''menu-images'' AND auth.role() = ''authenticated'''),
  ('Public can view menu images', 'menu-images', 'SELECT', 
   'bucket_id = ''menu-images'''),
  ('Users can update own menu images', 'menu-images', 'UPDATE', 
   'bucket_id = ''menu-images'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('Users can delete own menu images', 'menu-images', 'DELETE', 
   'bucket_id = ''menu-images'' AND auth.uid()::text = (storage.foldername(name))[1]');

-- Avatars bucket policies
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES 
  ('Authenticated users can upload avatars', 'avatars', 'INSERT', 
   'bucket_id = ''avatars'' AND auth.role() = ''authenticated'''),
  ('Public can view avatars', 'avatars', 'SELECT', 
   'bucket_id = ''avatars'''),
  ('Users can update own avatar', 'avatars', 'UPDATE', 
   'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('Users can delete own avatar', 'avatars', 'DELETE', 
   'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]');
