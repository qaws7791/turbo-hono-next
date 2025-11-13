CREATE TABLE "ai_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"learning_plan_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_invocations" jsonb,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_conversation" ADD CONSTRAINT "ai_conversation_learning_plan_id_learning_plan_id_fk" FOREIGN KEY ("learning_plan_id") REFERENCES "public"."learning_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversation" ADD CONSTRAINT "ai_conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_conversation_id_ai_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_conversation_learning_plan_id_idx" ON "ai_conversation" USING btree ("learning_plan_id");--> statement-breakpoint
CREATE INDEX "ai_conversation_user_id_idx" ON "ai_conversation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_message_conversation_id_created_at_idx" ON "ai_message" USING btree ("conversation_id","created_at" DESC NULLS LAST);