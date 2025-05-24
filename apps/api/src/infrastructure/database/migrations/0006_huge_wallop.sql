ALTER TABLE "stories" DROP CONSTRAINT "stories_region_id_regions_id_fk";
--> statement-breakpoint
ALTER TABLE "stories" DROP COLUMN "region_id";