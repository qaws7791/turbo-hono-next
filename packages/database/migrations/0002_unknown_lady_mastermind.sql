ALTER TABLE "ai_message" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_message" ADD COLUMN "parts" json NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_message" ADD COLUMN "attachments" json NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_message" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "ai_message" DROP COLUMN "tool_invocations";