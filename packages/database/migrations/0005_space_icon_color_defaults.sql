-- Migration: Add default values for icon and color in spaces table
-- This migration:
-- 1. Updates existing NULL values to defaults
-- 2. Sets NOT NULL constraint with DEFAULT values

-- Step 1: Update existing NULL values to defaults
UPDATE "spaces" SET "icon" = 'book' WHERE "icon" IS NULL;
UPDATE "spaces" SET "color" = 'blue' WHERE "color" IS NULL;

-- Step 2: Alter columns to set NOT NULL with DEFAULT
ALTER TABLE "spaces" ALTER COLUMN "icon" SET DEFAULT 'book';
ALTER TABLE "spaces" ALTER COLUMN "icon" SET NOT NULL;

ALTER TABLE "spaces" ALTER COLUMN "color" SET DEFAULT 'blue';
ALTER TABLE "spaces" ALTER COLUMN "color" SET NOT NULL;
