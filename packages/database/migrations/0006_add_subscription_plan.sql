-- Add subscription_plan column to users table
-- New enum type for subscription plans
DO $$ BEGIN
    CREATE TYPE "subscription_plan" AS ENUM('FREE', 'PRO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add subscription_plan column with default value
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_plan" "subscription_plan" NOT NULL DEFAULT 'FREE';
