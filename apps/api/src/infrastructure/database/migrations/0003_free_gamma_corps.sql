CREATE TABLE "objects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "objects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"bucket" text NOT NULL,
	"key" text NOT NULL,
	"content_type" text,
	"size" bigint,
	"is_uploaded" boolean DEFAULT false NOT NULL,
	"custom_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "objects_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "objects" ADD CONSTRAINT "objects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "objects_user_id_idx" ON "objects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "objects_bucket_key_idx" ON "objects" USING btree ("bucket","key");--> statement-breakpoint
CREATE INDEX "objects_is_uploaded_idx" ON "objects" USING btree ("is_uploaded");