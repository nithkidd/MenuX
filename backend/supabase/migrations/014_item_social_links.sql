-- Add new columns to the items table to support social links per item

ALTER TABLE items
ADD COLUMN map_url TEXT,
ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
