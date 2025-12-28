DELETE FROM "plan_generation_request_materials"
WHERE "material_id" IN (SELECT "id" FROM "materials" WHERE "source_type" = 'URL');--> statement-breakpoint
DELETE FROM "plan_source_materials"
WHERE "material_id" IN (SELECT "id" FROM "materials" WHERE "source_type" = 'URL');--> statement-breakpoint
DELETE FROM "materials" WHERE "source_type" = 'URL';--> statement-breakpoint
ALTER TABLE "materials" ALTER COLUMN "source_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."material_source_type";--> statement-breakpoint
CREATE TYPE "public"."material_source_type" AS ENUM('FILE', 'TEXT');--> statement-breakpoint
ALTER TABLE "materials" ALTER COLUMN "source_type" SET DATA TYPE "public"."material_source_type" USING "source_type"::"public"."material_source_type";
