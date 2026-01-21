ALTER TABLE "rag_collections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rag_documents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "rag_collections" CASCADE;--> statement-breakpoint
DROP TABLE "rag_documents" CASCADE;--> statement-breakpoint
ALTER TABLE "plan_generation_request_materials" DROP CONSTRAINT "plan_generation_request_materials_request_id_plan_generation_re";
--> statement-breakpoint
DROP INDEX "chat_threads_user_id_idx";--> statement-breakpoint
DROP INDEX "plan_modules_plan_id_idx";--> statement-breakpoint
DROP INDEX "plan_modules_plan_id_order_index_unique";--> statement-breakpoint
DROP INDEX "plan_sessions_plan_id_idx";--> statement-breakpoint
DROP INDEX "plan_sessions_plan_id_status_idx";--> statement-breakpoint
DROP INDEX "plan_sessions_public_id_unique";--> statement-breakpoint
DROP INDEX "plan_sessions_scheduled_for_date_idx";--> statement-breakpoint
DROP INDEX "coach_messages_user_date_unique";--> statement-breakpoint
DROP INDEX "auth_accounts_provider_account_unique";--> statement-breakpoint
DROP INDEX "auth_accounts_user_id_idx";--> statement-breakpoint
DROP INDEX "domain_events_user_id_idx";--> statement-breakpoint
DROP INDEX "auth_sessions_expires_at_idx";--> statement-breakpoint
DROP INDEX "auth_sessions_token_hash_unique";--> statement-breakpoint
DROP INDEX "auth_sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "magic_link_tokens_email_idx";--> statement-breakpoint
DROP INDEX "magic_link_tokens_expires_at_idx";--> statement-breakpoint
DROP INDEX "magic_link_tokens_token_hash_unique";--> statement-breakpoint
DROP INDEX "chat_messages_thread_id_created_at_idx";--> statement-breakpoint
DROP INDEX "material_embeddings_chunk_id_idx";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "material_jobs_material_id_idx";--> statement-breakpoint
DROP INDEX "material_jobs_status_idx";--> statement-breakpoint
DROP INDEX "material_chunks_material_id_idx";--> statement-breakpoint
DROP INDEX "material_chunks_material_id_ordinal_unique";--> statement-breakpoint
DROP INDEX "material_uploads_expires_at_idx";--> statement-breakpoint
DROP INDEX "material_uploads_status_idx";--> statement-breakpoint
DROP INDEX "material_uploads_user_id_created_at_idx";--> statement-breakpoint
DROP INDEX "plan_generation_requests_user_id_idx";--> statement-breakpoint
DROP INDEX "session_activities_run_id_idx";--> statement-breakpoint
DROP INDEX "materials_user_id_created_at_idx";--> statement-breakpoint
DROP INDEX "materials_user_id_idx";--> statement-breakpoint
DROP INDEX "materials_user_id_not_deleted_idx";--> statement-breakpoint
DROP INDEX "session_checkins_run_id_idx";--> statement-breakpoint
DROP INDEX "plans_one_active_per_user_unique";--> statement-breakpoint
DROP INDEX "plans_public_id_unique";--> statement-breakpoint
DROP INDEX "plans_user_id_idx";--> statement-breakpoint
DROP INDEX "plans_user_id_status_idx";--> statement-breakpoint
DROP INDEX "outline_nodes_material_id_idx";--> statement-breakpoint
DROP INDEX "outline_nodes_parent_id_idx";--> statement-breakpoint
DROP INDEX "chat_citations_message_id_idx";--> statement-breakpoint
DROP INDEX "session_runs_public_id_unique";--> statement-breakpoint
DROP INDEX "session_runs_running_unique";--> statement-breakpoint
DROP INDEX "session_runs_session_id_idx";--> statement-breakpoint
DROP INDEX "session_runs_user_id_idx";--> statement-breakpoint
DROP INDEX "session_runs_user_idempotency_key_unique";--> statement-breakpoint
DROP INDEX "session_progress_snapshots_run_id_idx";--> statement-breakpoint
DROP INDEX "session_run_blueprints_run_id_idx";--> statement-breakpoint
DROP INDEX "session_summaries_run_id_unique";--> statement-breakpoint
DROP INDEX "plan_generation_request_materials_request_id_idx";--> statement-breakpoint
DROP INDEX "plan_source_materials_material_id_idx";--> statement-breakpoint
DROP INDEX "plan_source_materials_plan_id_idx";--> statement-breakpoint
ALTER TABLE "plan_sessions" ADD COLUMN "source_references" jsonb;--> statement-breakpoint
ALTER TABLE "plan_generation_request_materials" ADD CONSTRAINT "plan_generation_request_materials_request_id_plan_generation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."plan_generation_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_threads_user_id_idx" ON "chat_threads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plan_modules_plan_id_idx" ON "plan_modules" USING btree ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_modules_plan_id_order_index_unique" ON "plan_modules" USING btree ("plan_id","order_index");--> statement-breakpoint
CREATE INDEX "plan_sessions_plan_id_idx" ON "plan_sessions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plan_sessions_plan_id_status_idx" ON "plan_sessions" USING btree ("plan_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_sessions_public_id_unique" ON "plan_sessions" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "plan_sessions_scheduled_for_date_idx" ON "plan_sessions" USING btree ("scheduled_for_date");--> statement-breakpoint
CREATE UNIQUE INDEX "coach_messages_user_date_unique" ON "coach_messages" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_accounts_provider_account_unique" ON "auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "auth_accounts_user_id_idx" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_events_user_id_idx" ON "domain_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_token_hash_unique" ON "auth_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "magic_link_tokens_email_idx" ON "magic_link_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "magic_link_tokens_expires_at_idx" ON "magic_link_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "magic_link_tokens_token_hash_unique" ON "magic_link_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "chat_messages_thread_id_created_at_idx" ON "chat_messages" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "material_embeddings_chunk_id_idx" ON "material_embeddings" USING btree ("chunk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "material_jobs_material_id_idx" ON "material_jobs" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "material_jobs_status_idx" ON "material_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "material_chunks_material_id_idx" ON "material_chunks" USING btree ("material_id");--> statement-breakpoint
CREATE UNIQUE INDEX "material_chunks_material_id_ordinal_unique" ON "material_chunks" USING btree ("material_id","ordinal");--> statement-breakpoint
CREATE INDEX "material_uploads_expires_at_idx" ON "material_uploads" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "material_uploads_status_idx" ON "material_uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "material_uploads_user_id_created_at_idx" ON "material_uploads" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "plan_generation_requests_user_id_idx" ON "plan_generation_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_activities_run_id_idx" ON "session_activities" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "materials_user_id_created_at_idx" ON "materials" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "materials_user_id_idx" ON "materials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "materials_user_id_not_deleted_idx" ON "materials" USING btree ("user_id") WHERE "materials"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "session_checkins_run_id_idx" ON "session_checkins" USING btree ("session_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_one_active_per_user_unique" ON "plans" USING btree ("user_id") WHERE "plans"."status" = 'ACTIVE';--> statement-breakpoint
CREATE UNIQUE INDEX "plans_public_id_unique" ON "plans" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "plans_user_id_idx" ON "plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plans_user_id_status_idx" ON "plans" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "outline_nodes_material_id_idx" ON "outline_nodes" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "outline_nodes_parent_id_idx" ON "outline_nodes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "chat_citations_message_id_idx" ON "chat_citations" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_runs_public_id_unique" ON "session_runs" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_runs_running_unique" ON "session_runs" USING btree ("session_id") WHERE "session_runs"."status" = 'RUNNING';--> statement-breakpoint
CREATE INDEX "session_runs_session_id_idx" ON "session_runs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_runs_user_id_idx" ON "session_runs" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_runs_user_idempotency_key_unique" ON "session_runs" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "session_progress_snapshots_run_id_idx" ON "session_progress_snapshots" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "session_run_blueprints_run_id_idx" ON "session_run_blueprints" USING btree ("session_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_summaries_run_id_unique" ON "session_summaries" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "plan_generation_request_materials_request_id_idx" ON "plan_generation_request_materials" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "plan_source_materials_material_id_idx" ON "plan_source_materials" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "plan_source_materials_plan_id_idx" ON "plan_source_materials" USING btree ("plan_id");