-- MenuBuilder MVP Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create business_type enum
CREATE TYPE business_type AS ENUM ('restaurant', 'gaming_gear');

-- Profiles table (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  business_type business_type NOT NULL DEFAULT 'restaurant',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_categories_business ON categories(business_id);
CREATE INDEX idx_items_category ON items(category_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Businesses policies
CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  USING (owner_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own businesses"
  ON businesses FOR INSERT
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own businesses"
  ON businesses FOR UPDATE
  USING (owner_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own businesses"
  ON businesses FOR DELETE
  USING (owner_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

-- Categories policies
CREATE POLICY "Users can manage categories of own businesses"
  ON categories FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses 
    WHERE owner_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  ));

CREATE POLICY "Public can view categories of active businesses"
  ON categories FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE is_active = true));

-- Items policies
CREATE POLICY "Users can manage items of own businesses"
  ON items FOR ALL
  USING (category_id IN (
    SELECT c.id FROM categories c
    JOIN businesses b ON c.business_id = b.id
    WHERE b.owner_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  ));

CREATE POLICY "Public can view available items of active businesses"
  ON items FOR SELECT
  USING (
    is_available = true AND
    category_id IN (
      SELECT c.id FROM categories c
      JOIN businesses b ON c.business_id = b.id
      WHERE b.is_active = true
    )
  );
