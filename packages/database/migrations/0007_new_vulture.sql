ALTER TABLE "materials" ADD COLUMN "processing_progress" integer;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "processing_step" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "generation_progress" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "generation_step" text;