-- Migration to add Khmer language support fields
-- Adds name_km fields for multilingual support

-- Add Khmer name fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS name_km TEXT,
ADD COLUMN IF NOT EXISTS exchange_rate_khr INTEGER DEFAULT 4000;

-- Add Khmer name fields to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS name_km TEXT;

-- Add Khmer name fields to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS name_km TEXT;

-- Add comments for documentation
COMMENT ON COLUMN businesses.name_km IS 'Business name in Khmer language';
COMMENT ON COLUMN businesses.exchange_rate_khr IS 'Exchange rate from USD to Khmer Riel (default: 4000)';
COMMENT ON COLUMN categories.name_km IS 'Category name in Khmer language';
COMMENT ON COLUMN items.name_km IS 'Item name in Khmer language';
