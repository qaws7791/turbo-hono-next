ALTER TABLE "domain_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "domain_events" CASCADE;--> statement-breakpoint
ALTER TABLE "plan_sessions" DROP CONSTRAINT "plan_sessions_module_id_plan_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "plan_modules" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_sessions" ALTER COLUMN "module_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_sessions" ALTER COLUMN "objective" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_sessions" ADD CONSTRAINT "plan_sessions_module_id_plan_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."plan_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outline_nodes" ADD CONSTRAINT "outline_nodes_parent_id_outline_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."outline_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" DROP COLUMN "source_type";--> statement-breakpoint
DROP TYPE "public"."material_source_type";