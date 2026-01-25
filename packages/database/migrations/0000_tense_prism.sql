CREATE TYPE "public"."auth_provider" AS ENUM('GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."material_job_status" AS ENUM('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."material_job_type" AS ENUM('TEXT_EXTRACT', 'OUTLINE', 'CHUNK', 'EMBED');--> statement-breakpoint
CREATE TYPE "public"."material_processing_status" AS ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."material_upload_status" AS ENUM('INITIATED', 'COMPLETED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."outline_node_type" AS ENUM('SECTION', 'TOPIC');--> statement-breakpoint
CREATE TYPE "public"."plan_generation_request_status" AS ENUM('DRAFT', 'SUBMITTED', 'GENERATING', 'SUCCEEDED', 'FAILED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."plan_generation_status" AS ENUM('PENDING', 'GENERATING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."plan_session_status" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."plan_session_type" AS ENUM('LEARN');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('ACTIVE', 'PAUSED', 'ARCHIVED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."session_activity_kind" AS ENUM('EXERCISE', 'MCQ', 'FREEFORM', 'CODE');--> statement-breakpoint
CREATE TYPE "public"."session_checkin_kind" AS ENUM('QUESTION', 'SELF_ASSESSMENT', 'BEHAVIOR_SIGNAL');--> statement-breakpoint
CREATE TYPE "public"."session_exit_reason" AS ENUM('USER_EXIT', 'NETWORK', 'ERROR', 'TIMEOUT');--> statement-breakpoint
CREATE TYPE "public"."session_run_status" AS ENUM('RUNNING', 'COMPLETED', 'ABANDONED');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('R2');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('FREE', 'PRO');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TABLE "plan_modules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"plan_id" bigint NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" varchar(12) NOT NULL,
	"plan_id" bigint NOT NULL,
	"module_id" uuid NOT NULL,
	"session_type" "plan_session_type" NOT NULL,
	"title" text NOT NULL,
	"objective" text NOT NULL,
	"order_index" integer NOT NULL,
	"scheduled_for_date" date NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"source_references" jsonb,
	"status" "plan_session_status" DEFAULT 'SCHEDULED' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "coach_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"content_md" text NOT NULL,
	"context_json" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"access_token_enc" text,
	"refresh_token_enc" text,
	"scopes" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_ip" text,
	"user_agent" text,
	"rotated_from_id" uuid,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"redirect_path" text NOT NULL,
	"created_ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"locale" text DEFAULT 'ko-KR' NOT NULL,
	"timezone" text DEFAULT 'Asia/Seoul' NOT NULL,
	"last_login_at" timestamp with time zone,
	"subscription_plan" "subscription_plan" DEFAULT 'FREE' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"material_id" uuid NOT NULL,
	"ordinal" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer,
	"page_start" integer,
	"page_end" integer,
	"section_path" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_embeddings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"chunk_id" uuid NOT NULL,
	"model" text NOT NULL,
	"vector" vector(1536) NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"material_id" uuid NOT NULL,
	"job_type" "material_job_type" NOT NULL,
	"status" "material_job_status" DEFAULT 'QUEUED' NOT NULL,
	"progress" numeric,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error_json" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_uploads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "material_upload_status" DEFAULT 'INITIATED' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"object_key" text NOT NULL,
	"final_object_key" text,
	"original_filename" text,
	"mime_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"etag" text,
	"material_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"original_filename" text,
	"source_url" text,
	"storage_provider" "storage_provider" DEFAULT 'R2',
	"storage_key" text,
	"mime_type" text,
	"file_size" bigint,
	"checksum" text,
	"processing_status" "material_processing_status" DEFAULT 'PENDING' NOT NULL,
	"processing_progress" integer,
	"processing_step" text,
	"processed_at" timestamp with time zone,
	"summary" text,
	"error_message" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outline_nodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"material_id" uuid NOT NULL,
	"parent_id" uuid,
	"node_type" "outline_node_type" NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"keywords" text[],
	"order_index" integer NOT NULL,
	"depth" integer NOT NULL,
	"path" text NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_generation_request_materials" (
	"request_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "plan_generation_request_materials_request_id_material_id_pk" PRIMARY KEY("request_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "plan_generation_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "plan_generation_request_status" DEFAULT 'DRAFT' NOT NULL,
	"target_due_date" date NOT NULL,
	"special_requirements" text,
	"preview_json" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_source_materials" (
	"plan_id" bigint NOT NULL,
	"material_id" uuid NOT NULL,
	"material_title_snapshot" text,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "plan_source_materials_plan_id_material_id_pk" PRIMARY KEY("plan_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" varchar(12) NOT NULL,
	"user_id" uuid NOT NULL,
	"generation_request_id" uuid,
	"title" text NOT NULL,
	"icon" text DEFAULT 'target' NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"status" "plan_status" DEFAULT 'PAUSED' NOT NULL,
	"target_due_date" date NOT NULL,
	"special_requirements" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"generation_status" "plan_generation_status" DEFAULT 'READY' NOT NULL,
	"generation_progress" integer,
	"generation_step" text,
	"generation_error" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rag_collections" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"cmetadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "rag_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text,
	"metadata" jsonb,
	"vector" vector(1536),
	"collection_id" uuid
);
--> statement-breakpoint
CREATE TABLE "session_activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_run_id" bigint NOT NULL,
	"kind" "session_activity_kind" NOT NULL,
	"prompt" text NOT NULL,
	"user_answer" text,
	"ai_eval_json" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_checkins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_run_id" bigint NOT NULL,
	"kind" "session_checkin_kind" NOT NULL,
	"prompt" text NOT NULL,
	"response_json" jsonb,
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_progress_snapshots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_run_id" bigint NOT NULL,
	"step_index" integer NOT NULL,
	"payload_json" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_run_blueprints" (
	"session_run_id" bigint PRIMARY KEY NOT NULL,
	"schema_version" integer NOT NULL,
	"blueprint_json" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_runs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" varchar(12) NOT NULL,
	"session_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" bigint NOT NULL,
	"idempotency_key" uuid,
	"status" "session_run_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"exit_reason" "session_exit_reason",
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_summaries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_run_id" bigint NOT NULL,
	"summary_md" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_modules" ADD CONSTRAINT "plan_modules_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_sessions" ADD CONSTRAINT "plan_sessions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_sessions" ADD CONSTRAINT "plan_sessions_module_id_plan_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."plan_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_chunks" ADD CONSTRAINT "material_chunks_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_embeddings" ADD CONSTRAINT "material_embeddings_chunk_id_material_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."material_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_jobs" ADD CONSTRAINT "material_jobs_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_uploads" ADD CONSTRAINT "material_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_uploads" ADD CONSTRAINT "material_uploads_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outline_nodes" ADD CONSTRAINT "outline_nodes_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outline_nodes" ADD CONSTRAINT "outline_nodes_parent_id_outline_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."outline_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_generation_request_materials" ADD CONSTRAINT "plan_generation_request_materials_request_id_plan_generation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."plan_generation_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_generation_request_materials" ADD CONSTRAINT "plan_generation_request_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_generation_requests" ADD CONSTRAINT "plan_generation_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_source_materials" ADD CONSTRAINT "plan_source_materials_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_source_materials" ADD CONSTRAINT "plan_source_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_generation_request_id_plan_generation_requests_id_fk" FOREIGN KEY ("generation_request_id") REFERENCES "public"."plan_generation_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_collection_id_rag_collections_uuid_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."rag_collections"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_session_run_id_session_runs_id_fk" FOREIGN KEY ("session_run_id") REFERENCES "public"."session_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_checkins" ADD CONSTRAINT "session_checkins_session_run_id_session_runs_id_fk" FOREIGN KEY ("session_run_id") REFERENCES "public"."session_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_progress_snapshots" ADD CONSTRAINT "session_progress_snapshots_session_run_id_session_runs_id_fk" FOREIGN KEY ("session_run_id") REFERENCES "public"."session_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_run_blueprints" ADD CONSTRAINT "session_run_blueprints_session_run_id_session_runs_id_fk" FOREIGN KEY ("session_run_id") REFERENCES "public"."session_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_runs" ADD CONSTRAINT "session_runs_session_id_plan_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."plan_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_runs" ADD CONSTRAINT "session_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_runs" ADD CONSTRAINT "session_runs_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_session_run_id_session_runs_id_fk" FOREIGN KEY ("session_run_id") REFERENCES "public"."session_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "plan_modules_plan_id_order_index_unique" ON "plan_modules" USING btree ("plan_id","order_index");--> statement-breakpoint
CREATE INDEX "plan_modules_plan_id_idx" ON "plan_modules" USING btree ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_sessions_public_id_unique" ON "plan_sessions" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "plan_sessions_plan_id_idx" ON "plan_sessions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_sessions_scheduled_for_date_idx" ON "plan_sessions" USING btree ("scheduled_for_date");--> statement-breakpoint
CREATE INDEX "plan_sessions_plan_id_status_idx" ON "plan_sessions" USING btree ("plan_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "coach_messages_user_date_unique" ON "coach_messages" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_accounts_provider_account_unique" ON "auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "auth_accounts_user_id_idx" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_token_hash_unique" ON "auth_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "magic_link_tokens_token_hash_unique" ON "magic_link_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "magic_link_tokens_expires_at_idx" ON "magic_link_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "magic_link_tokens_email_idx" ON "magic_link_tokens" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "material_chunks_material_id_ordinal_unique" ON "material_chunks" USING btree ("material_id","ordinal");--> statement-breakpoint
CREATE INDEX "material_chunks_material_id_idx" ON "material_chunks" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "material_embeddings_chunk_id_idx" ON "material_embeddings" USING btree ("chunk_id");--> statement-breakpoint
CREATE INDEX "material_jobs_material_id_idx" ON "material_jobs" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "material_jobs_status_idx" ON "material_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "material_uploads_user_id_created_at_idx" ON "material_uploads" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "material_uploads_expires_at_idx" ON "material_uploads" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "material_uploads_status_idx" ON "material_uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "materials_user_id_idx" ON "materials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "materials_user_id_created_at_idx" ON "materials" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "materials_user_id_not_deleted_idx" ON "materials" USING btree ("user_id") WHERE "materials"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "outline_nodes_material_id_idx" ON "outline_nodes" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "outline_nodes_parent_id_idx" ON "outline_nodes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "plan_generation_request_materials_request_id_idx" ON "plan_generation_request_materials" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "plan_generation_requests_user_id_idx" ON "plan_generation_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plan_source_materials_plan_id_idx" ON "plan_source_materials" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_source_materials_material_id_idx" ON "plan_source_materials" USING btree ("material_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_public_id_unique" ON "plans" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "plans_user_id_idx" ON "plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plans_user_id_status_idx" ON "plans" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_one_active_per_user_unique" ON "plans" USING btree ("user_id") WHERE "plans"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "idx_rag_collections_name" ON "rag_collections" USING btree ("name");--> statement-breakpoint
CREATE INDEX "session_activities_run_id_idx" ON "session_activities" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "session_checkins_run_id_idx" ON "session_checkins" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "session_progress_snapshots_run_id_idx" ON "session_progress_snapshots" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "session_run_blueprints_run_id_idx" ON "session_run_blueprints" USING btree ("session_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_runs_public_id_unique" ON "session_runs" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "session_runs_user_id_idx" ON "session_runs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_runs_session_id_idx" ON "session_runs" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_runs_user_idempotency_key_unique" ON "session_runs" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "session_runs_running_unique" ON "session_runs" USING btree ("session_id") WHERE "session_runs"."status" = 'RUNNING';--> statement-breakpoint
CREATE UNIQUE INDEX "session_summaries_run_id_unique" ON "session_summaries" USING btree ("session_run_id");