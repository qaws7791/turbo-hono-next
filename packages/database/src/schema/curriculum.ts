import {
  bigint,
  bigserial,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { planSessionStatusEnum, planSessionTypeEnum } from "./enums";
import { plans } from "./plans";

/* ========== 6) Curriculum: Modules & Sessions ========== */

export const planModules = pgTable(
  "plan_modules",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    planId: bigint("plan_id", { mode: "number" })
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("plan_modules_plan_id_order_index_unique").on(
      table.planId,
      table.orderIndex,
    ),
    index("plan_modules_plan_id_idx").on(table.planId),
  ],
);

export const planSessions = pgTable(
  "plan_sessions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    planId: bigint("plan_id", { mode: "number" })
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id").references(() => planModules.id, {
      onDelete: "set null",
    }),
    sessionType: planSessionTypeEnum("session_type").notNull(),
    title: text("title").notNull(),
    objective: text("objective"),
    orderIndex: integer("order_index").notNull(),
    scheduledForDate: date("scheduled_for_date", { mode: "date" }).notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    status: planSessionStatusEnum("status").notNull().default("SCHEDULED"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    uniqueIndex("plan_sessions_public_id_unique").on(table.publicId),
    index("plan_sessions_plan_id_idx").on(table.planId),
    index("plan_sessions_scheduled_for_date_idx").on(table.scheduledForDate),
    index("plan_sessions_plan_id_status_idx").on(table.planId, table.status),
  ],
);
