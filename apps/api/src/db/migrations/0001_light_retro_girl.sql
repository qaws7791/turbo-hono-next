ALTER TABLE "reactions" ALTER COLUMN "reaction_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."reaction_type";--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'heart', 'clap', 'fire', 'idea');--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "reaction_type" SET DATA TYPE "public"."reaction_type" USING "reaction_type"::"public"."reaction_type";