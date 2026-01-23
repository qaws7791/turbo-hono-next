CREATE TYPE "public"."plan_generation_status" AS ENUM('PENDING', 'GENERATING', 'READY', 'FAILED');--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "generation_status" "plan_generation_status" DEFAULT 'READY' NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "generation_error" text;