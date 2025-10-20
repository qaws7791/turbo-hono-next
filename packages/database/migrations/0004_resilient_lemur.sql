CREATE TABLE IF NOT EXISTS "ai_note" (
  "id" serial PRIMARY KEY,
  "sub_goal_id" integer NOT NULL,
  "status" text DEFAULT 'idle' NOT NULL,
  "markdown" text,
  "requested_at" timestamp,
  "completed_at" timestamp,
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_note"
  ADD CONSTRAINT "ai_note_sub_goal_id_sub_goal_id_fk"
  FOREIGN KEY ("sub_goal_id") REFERENCES "sub_goal" ("id")
  ON DELETE cascade;
--> statement-breakpoint
DROP INDEX IF EXISTS "sub_goal_ai_note_status_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ai_note_sub_goal_id_idx" ON "ai_note" ("sub_goal_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_note_status_idx" ON "ai_note" ("status");
--> statement-breakpoint
INSERT INTO "ai_note" (
  "sub_goal_id",
  "status",
  "markdown",
  "requested_at",
  "completed_at",
  "error_message",
  "created_at",
  "updated_at"
)
SELECT
  "id" AS "sub_goal_id",
  COALESCE("ai_note_status", 'idle') AS "status",
  "ai_note_markdown" AS "markdown",
  "ai_note_requested_at" AS "requested_at",
  "ai_note_completed_at" AS "completed_at",
  "ai_note_error" AS "error_message",
  COALESCE("ai_note_requested_at", "created_at", now()) AS "created_at",
  COALESCE("ai_note_completed_at", "updated_at", now()) AS "updated_at"
FROM "sub_goal"
WHERE
  "ai_note_status" IS NOT NULL
  OR "ai_note_markdown" IS NOT NULL
  OR "ai_note_requested_at" IS NOT NULL
  OR "ai_note_completed_at" IS NOT NULL
  OR "ai_note_error" IS NOT NULL
ON CONFLICT ("sub_goal_id") DO UPDATE
SET
  "status" = EXCLUDED."status",
  "markdown" = EXCLUDED."markdown",
  "requested_at" = EXCLUDED."requested_at",
  "completed_at" = EXCLUDED."completed_at",
  "error_message" = EXCLUDED."error_message",
  "updated_at" = EXCLUDED."updated_at";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP COLUMN IF EXISTS "ai_note_status";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP COLUMN IF EXISTS "ai_note_markdown";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP COLUMN IF EXISTS "ai_note_requested_at";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP COLUMN IF EXISTS "ai_note_completed_at";
--> statement-breakpoint
ALTER TABLE "sub_goal" DROP COLUMN IF EXISTS "ai_note_error";
