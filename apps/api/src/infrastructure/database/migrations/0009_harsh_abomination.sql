ALTER TABLE "stories" DROP CONSTRAINT "stories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "introduction" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "introduction" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "business_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "business_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "owner_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "sido_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "sigungu_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ALTER COLUMN "contact_info" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stories" DROP COLUMN "category_id";