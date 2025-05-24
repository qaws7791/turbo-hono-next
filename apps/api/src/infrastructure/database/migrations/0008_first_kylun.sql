ALTER TABLE "creator_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "creator_categories" CASCADE;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creators_category_id_idx" ON "creators" USING btree ("category_id");