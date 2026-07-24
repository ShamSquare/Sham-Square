-- =============================================================================
-- AshityShop — Data Migration: Categories/SubCategories to Enums
-- =============================================================================
-- Run this AFTER running the schema migration to migrate existing products.
-- =============================================================================

-- Step 1: Add the new category and sub_category columns if they don't exist
-- (they should already exist from the updated migration.sql)
-- This is just a safety check for existing databases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sub_category'
  ) THEN
    ALTER TABLE products ADD COLUMN sub_category text;
  END IF;
END $$;

-- Step 2: Migrate existing products' category values
-- Map old category names to enum values via the categories table
UPDATE products p
SET category = CASE
    WHEN c.name ILIKE '%duha%' OR c.name ILIKE '%al-duha%' OR c.name ILIKE '%الضحى%' THEN 'AL_DUHA_LIBRARY'
    WHEN c.name ILIKE '%crochet%' OR c.name ILIKE '%كروشيه%' THEN 'CROCHET'
    WHEN c.name ILIKE '%anime%' OR c.name ILIKE '%أنمي%' OR c.name ILIKE '%انمي%' THEN 'ANIME'
    WHEN c.name ILIKE '%handmade%' OR c.name ILIKE '%hand made%' OR c.name ILIKE '%أشغال يدوية%' OR c.name ILIKE '%يدوي%' THEN 'HANDMADE'
    ELSE NULL
  END
FROM categories c
WHERE p.category_id = c.id;

-- Step 3: Migrate existing products' sub_category values
-- Only migrate for AL_DUHA_LIBRARY products
UPDATE products p
SET sub_category = CASE
    WHEN sc.name ILIKE '%library%' OR sc.name ILIKE '%منتجات المكتبة%' OR sc.name ILIKE '%مكتبة%' THEN 'LIBRARY_PRODUCTS'
    WHEN sc.name ILIKE '%printing%' OR sc.name ILIKE '%طباعة%' OR sc.name ILIKE '%خدمات الطباعة%' THEN 'PRINTING_SERVICES'
    ELSE NULL
  END
FROM subcategories sc
WHERE p.sub_category_id = sc.id
  AND p.category = 'AL_DUHA_LIBRARY';

-- Step 4: Set default category for any products that weren't matched
UPDATE products
SET category = 'HANDMADE'
WHERE category IS NULL AND is_deleted = false;

-- Step 5: Remove old foreign key columns if they exist
-- DO NOT run this until you've verified the data migration is correct
-- ALTER TABLE products DROP COLUMN IF EXISTS category_id;
-- ALTER TABLE products DROP COLUMN IF EXISTS sub_category_id;

-- Step 6: Verify the migration
SELECT id, name, category, sub_category FROM products WHERE is_deleted = false ORDER BY name;

-- Step 7: After verifying, drop the old tables
-- DROP TABLE IF EXISTS subcategories;
-- DROP TABLE IF EXISTS categories;

COMMENT ON TABLE products IS 'Products migrated to fixed enums for category/subcategory';