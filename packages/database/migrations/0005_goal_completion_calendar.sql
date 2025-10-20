ALTER TABLE "sub_goal"
ADD COLUMN "completed_at" timestamp;

CREATE INDEX IF NOT EXISTS "sub_goal_completed_at_idx"
  ON "sub_goal" ("completed_at");
