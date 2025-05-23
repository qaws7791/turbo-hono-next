DROP INDEX "creators_location_idx";--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "business_number" varchar(20);--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "business_name" varchar(255);--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "owner_name" varchar(100);--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "region_id" integer;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "cover_image_url" varchar(255);--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creators_region_id_idx" ON "creators" USING btree ("region_id");--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN "background_image_url";--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN "location";