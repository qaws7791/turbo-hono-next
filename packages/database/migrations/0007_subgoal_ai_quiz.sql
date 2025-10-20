CREATE TABLE "ai_quiz" (
	"id" serial PRIMARY KEY NOT NULL,
	"sub_goal_id" integer NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"questions" jsonb,
	"target_question_count" integer DEFAULT 4 NOT NULL,
	"total_questions" integer,
	"requested_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_quiz_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_count" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"submitted_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_quiz" ADD CONSTRAINT "ai_quiz_sub_goal_id_sub_goal_id_fk" FOREIGN KEY ("sub_goal_id") REFERENCES "public"."sub_goal"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ai_quiz_result" ADD CONSTRAINT "ai_quiz_result_quiz_id_ai_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."ai_quiz"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ai_quiz_result" ADD CONSTRAINT "ai_quiz_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "ai_quiz_sub_goal_id_idx" ON "ai_quiz" USING btree ("sub_goal_id");
--> statement-breakpoint
CREATE INDEX "ai_quiz_status_idx" ON "ai_quiz" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "ai_quiz_result_quiz_id_idx" ON "ai_quiz_result" USING btree ("quiz_id");
--> statement-breakpoint
CREATE INDEX "ai_quiz_result_user_id_idx" ON "ai_quiz_result" USING btree ("user_id");
