CREATE TABLE "sido" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sido_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	CONSTRAINT "sido_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sigungu" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sigungu_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sido_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "sigungu_sido_id_name_unique" UNIQUE("sido_id","name")
);
--> statement-breakpoint
ALTER TABLE "regions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "regions" CASCADE;--> statement-breakpoint
ALTER TABLE "creators" DROP CONSTRAINT "creators_region_id_regions_id_fk";
--> statement-breakpoint
DROP INDEX "creators_region_id_idx";--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "sido_id" integer;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "sigungu_id" integer;--> statement-breakpoint
ALTER TABLE "sigungu" ADD CONSTRAINT "sigungu_sido_id_sido_id_fk" FOREIGN KEY ("sido_id") REFERENCES "public"."sido"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sido_name_idx" ON "sido" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sigungu_sido_id_idx" ON "sigungu" USING btree ("sido_id");--> statement-breakpoint
CREATE INDEX "sigungu_name_idx" ON "sigungu" USING btree ("name");--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_sido_id_sido_id_fk" FOREIGN KEY ("sido_id") REFERENCES "public"."sido"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_sigungu_id_sigungu_id_fk" FOREIGN KEY ("sigungu_id") REFERENCES "public"."sigungu"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creators_sido_id_idx" ON "creators" USING btree ("sido_id");--> statement-breakpoint
CREATE INDEX "creators_sigungu_id_idx" ON "creators" USING btree ("sigungu_id");--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN "region_id";