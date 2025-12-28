import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  planCurrentLevelEnum,
  planGenerationRequestStatusEnum,
  planGoalTypeEnum,
  planStatusEnum,
} from "./enums";
import { users } from "./identity";
import { materials } from "./materials";
import { spaces } from "./space";
import { timestamps } from "./shared";

/* ========== 5) Plans ========== */

export const planGenerationRequests = pgTable(
  "plan_generation_requests",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spaceId: bigint("space_id", { mode: "number" })
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    status: planGenerationRequestStatusEnum("status")
      .notNull()
      .default("DRAFT"),
    goalType: planGoalTypeEnum("goal_type").notNull(),
    goalText: text("goal_text"),
    currentLevel: planCurrentLevelEnum("current_level").notNull(),
    targetDueDate: date("target_due_date", { mode: "date" }).notNull(),
    specialRequirements: text("special_requirements"),
    previewJson: jsonb("preview_json").$type<Record<string, unknown>>(),
    errorMessage: text("error_message"),
    ...timestamps,
  },
  (table) => [
    index("plan_generation_requests_user_id_idx").on(table.userId),
    index("plan_generation_requests_space_id_idx").on(table.spaceId),
  ],
);

export const planGenerationRequestMaterials = pgTable(
  "plan_generation_request_materials",
  {
    requestId: uuid("request_id")
      .notNull()
      .references(() => planGenerationRequests.id, { onDelete: "cascade" }),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "restrict" }),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.requestId, table.materialId] }),
    index("plan_generation_request_materials_request_id_idx").on(
      table.requestId,
    ),
  ],
);

export const plans = pgTable(
  "plans",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spaceId: bigint("space_id", { mode: "number" })
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    generationRequestId: uuid("generation_request_id").references(
      () => planGenerationRequests.id,
      { onDelete: "set null" },
    ),
    title: text("title").notNull(),
    status: planStatusEnum("status").notNull().default("PAUSED"),
    goalType: planGoalTypeEnum("goal_type").notNull(),
    goalText: text("goal_text"),
    currentLevel: planCurrentLevelEnum("current_level").notNull(),
    targetDueDate: date("target_due_date", { mode: "date" }).notNull(),
    specialRequirements: text("special_requirements"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("plans_public_id_unique").on(table.publicId),
    index("plans_space_id_idx").on(table.spaceId),
    index("plans_user_id_idx").on(table.userId),
    index("plans_space_id_status_idx").on(table.spaceId, table.status),
    uniqueIndex("plans_one_active_per_space_unique")
      .on(table.spaceId)
      .where(sql`${table.status} = 'ACTIVE'`),
  ],
);

export const planSourceMaterials = pgTable(
  "plan_source_materials",
  {
    planId: bigint("plan_id", { mode: "number" })
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "restrict" }),
    materialTitleSnapshot: text("material_title_snapshot"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.planId, table.materialId] }),
    index("plan_source_materials_plan_id_idx").on(table.planId),
    index("plan_source_materials_material_id_idx").on(table.materialId),
  ],
);
