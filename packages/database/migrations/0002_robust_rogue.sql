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
ALTER TABLE "outline_nodes" ADD COLUMN "keywords" text[];--> statement-breakpoint
ALTER TABLE "outline_nodes" ADD COLUMN "metadata_json" jsonb;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_collection_id_rag_collections_uuid_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."rag_collections"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rag_collections_name" ON "rag_collections" USING btree ("name");--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "raw_text";--> statement-breakpoint
ALTER TABLE "plan_generation_requests" DROP COLUMN "goal_type";--> statement-breakpoint
ALTER TABLE "plan_generation_requests" DROP COLUMN "goal_text";--> statement-breakpoint
ALTER TABLE "plan_generation_requests" DROP COLUMN "current_level";--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "goal_type";--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "goal_text";--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "current_level";
DROP TYPE "public"."plan_current_level";--> statement-breakpoint
DROP TYPE "public"."plan_goal_type";