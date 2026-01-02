CREATE TABLE "session_run_blueprints" (
	"session_run_id" bigint PRIMARY KEY NOT NULL,
	"schema_version" integer NOT NULL,
	"blueprint_json" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_run_blueprints" ADD CONSTRAINT "session_run_blueprints_session_run_id_session_runs_id_fk" FOREIGN KEY ("session_run_id") REFERENCES "public"."session_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_run_blueprints_run_id_idx" ON "session_run_blueprints" USING btree ("session_run_id");