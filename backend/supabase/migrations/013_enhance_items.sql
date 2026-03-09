-- Add new columns to the items table to support the redesigned showcase platform

ALTER TABLE items
ADD COLUMN image_urls TEXT[] DEFAULT '{}',
ADD COLUMN original_price DECIMAL(10, 2),
ADD COLUMN sku TEXT,
ADD COLUMN is_hot BOOLEAN DEFAULT false;

-- Add an index on sku for faster lookups (optional but good practice if SKUs are used for searching)
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
