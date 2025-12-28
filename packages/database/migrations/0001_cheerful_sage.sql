CREATE TYPE "public"."material_upload_status" AS ENUM('INITIATED', 'COMPLETED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "material_uploads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"space_id" bigint NOT NULL,
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
ALTER TABLE "material_uploads" ADD CONSTRAINT "material_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_uploads" ADD CONSTRAINT "material_uploads_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_uploads" ADD CONSTRAINT "material_uploads_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "material_uploads_user_space_created_at_idx" ON "material_uploads" USING btree ("user_id","space_id","created_at");--> statement-breakpoint
CREATE INDEX "material_uploads_expires_at_idx" ON "material_uploads" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "material_uploads_status_idx" ON "material_uploads" USING btree ("status");