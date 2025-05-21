ALTER TABLE "stories" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "stories" ALTER COLUMN "status" SET DEFAULT 'published'::text;--> statement-breakpoint
DROP TYPE "public"."story_status";--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('published', 'hidden', 'deleted');--> statement-breakpoint
ALTER TABLE "stories" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."story_status";--> statement-breakpoint
ALTER TABLE "stories" ALTER COLUMN "status" SET DATA TYPE "public"."story_status" USING "status"::"public"."story_status";--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "content_text" text NOT NULL;