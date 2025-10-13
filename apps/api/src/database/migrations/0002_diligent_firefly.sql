ALTER TABLE "sub_goal" ADD COLUMN IF NOT EXISTS "ai_note_status" text DEFAULT 'idle' NOT NULL;
--> statement-breakpoint
ALTER TABLE "sub_goal" ADD COLUMN IF NOT EXISTS "ai_note_markdown" text;
--> statement-breakpoint
ALTER TABLE "sub_goal" ADD COLUMN IF NOT EXISTS "ai_note_requested_at" timestamp;
--> statement-breakpoint
ALTER TABLE "sub_goal" ADD COLUMN IF NOT EXISTS "ai_note_completed_at" timestamp;
--> statement-breakpoint
ALTER TABLE "sub_goal" ADD COLUMN IF NOT EXISTS "ai_note_error" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_goal_ai_note_status_idx" ON "sub_goal" ("ai_note_status");
