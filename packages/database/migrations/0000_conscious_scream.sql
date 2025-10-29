CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_note" (
	"id" serial PRIMARY KEY NOT NULL,
	"learning_task_id" integer NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"markdown" text,
	"requested_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_quiz" (
	"id" serial PRIMARY KEY NOT NULL,
	"learning_task_id" integer NOT NULL,
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
CREATE TABLE "learning_module" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"learning_plan_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"is_expanded" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "learning_module_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "learning_plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(16) NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"emoji" varchar(16) DEFAULT '📚' NOT NULL,
	"learning_topic" text NOT NULL,
	"user_level" text NOT NULL,
	"target_weeks" integer NOT NULL,
	"weekly_hours" integer NOT NULL,
	"learning_style" text NOT NULL,
	"preferred_resources" text NOT NULL,
	"main_goal" text NOT NULL,
	"additional_requirements" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "learning_plan_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "learning_plan_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"learning_plan_id" integer,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"storage_url" text NOT NULL,
	"uploaded_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "learning_plan_document_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "learning_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"learning_module_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"due_date" timestamp,
	"memo" text,
	"order" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "learning_task_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_note" ADD CONSTRAINT "ai_note_learning_task_id_learning_task_id_fk" FOREIGN KEY ("learning_task_id") REFERENCES "public"."learning_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_quiz" ADD CONSTRAINT "ai_quiz_learning_task_id_learning_task_id_fk" FOREIGN KEY ("learning_task_id") REFERENCES "public"."learning_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_quiz_result" ADD CONSTRAINT "ai_quiz_result_quiz_id_ai_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."ai_quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_quiz_result" ADD CONSTRAINT "ai_quiz_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_module" ADD CONSTRAINT "learning_module_learning_plan_id_learning_plan_id_fk" FOREIGN KEY ("learning_plan_id") REFERENCES "public"."learning_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_plan" ADD CONSTRAINT "learning_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_plan_document" ADD CONSTRAINT "learning_plan_document_learning_plan_id_learning_plan_id_fk" FOREIGN KEY ("learning_plan_id") REFERENCES "public"."learning_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_plan_document" ADD CONSTRAINT "learning_plan_document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_task" ADD CONSTRAINT "learning_task_learning_module_id_learning_module_id_fk" FOREIGN KEY ("learning_module_id") REFERENCES "public"."learning_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_note_learning_task_id_idx" ON "ai_note" USING btree ("learning_task_id");--> statement-breakpoint
CREATE INDEX "ai_note_status_idx" ON "ai_note" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_quiz_learning_task_id_idx" ON "ai_quiz" USING btree ("learning_task_id");--> statement-breakpoint
CREATE INDEX "ai_quiz_status_idx" ON "ai_quiz" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_quiz_result_quiz_id_idx" ON "ai_quiz_result" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "ai_quiz_result_user_id_idx" ON "ai_quiz_result" USING btree ("user_id");