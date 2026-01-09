import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { planSessions } from "./curriculum";
import {
  sessionActivityKindEnum,
  sessionCheckinKindEnum,
  sessionExitReasonEnum,
  sessionRunStatusEnum,
} from "./enums";
import { users } from "./identity";
import { plans } from "./plans";

/* ========== 7) Session Execution ========== */

export const sessionRuns = pgTable(
  "session_runs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    sessionId: bigint("session_id", { mode: "number" })
      .notNull()
      .references(() => planSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: bigint("plan_id", { mode: "number" })
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    idempotencyKey: uuid("idempotency_key"),
    status: sessionRunStatusEnum("status").notNull(),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
    exitReason: sessionExitReasonEnum("exit_reason"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("session_runs_public_id_unique").on(table.publicId),
    index("session_runs_user_id_idx").on(table.userId),
    index("session_runs_session_id_idx").on(table.sessionId),
    uniqueIndex("session_runs_user_idempotency_key_unique").on(
      table.userId,
      table.idempotencyKey,
    ),
    uniqueIndex("session_runs_running_unique")
      .on(table.sessionId)
      .where(sql`${table.status} = 'RUNNING'`),
  ],
);

export const sessionProgressSnapshots = pgTable(
  "session_progress_snapshots",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .notNull()
      .references(() => sessionRuns.id, { onDelete: "cascade" }),
    stepIndex: integer("step_index").notNull(),
    payloadJson: jsonb("payload_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("session_progress_snapshots_run_id_idx").on(table.sessionRunId),
  ],
);

export const sessionRunBlueprints = pgTable(
  "session_run_blueprints",
  {
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .primaryKey()
      .references(() => sessionRuns.id, { onDelete: "cascade" }),
    schemaVersion: integer("schema_version").notNull(),
    blueprintJson: jsonb("blueprint_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("session_run_blueprints_run_id_idx").on(table.sessionRunId),
  ],
);

export const sessionCheckins = pgTable(
  "session_checkins",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .notNull()
      .references(() => sessionRuns.id, { onDelete: "cascade" }),
    kind: sessionCheckinKindEnum("kind").notNull(),
    prompt: text("prompt").notNull(),
    responseJson: jsonb("response_json").$type<Record<string, unknown>>(),
    recordedAt: timestamp("recorded_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("session_checkins_run_id_idx").on(table.sessionRunId)],
);

export const sessionActivities = pgTable(
  "session_activities",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .notNull()
      .references(() => sessionRuns.id, { onDelete: "cascade" }),
    kind: sessionActivityKindEnum("kind").notNull(),
    prompt: text("prompt").notNull(),
    userAnswer: text("user_answer"),
    aiEvalJson: jsonb("ai_eval_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("session_activities_run_id_idx").on(table.sessionRunId)],
);

export const sessionSummaries = pgTable(
  "session_summaries",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .notNull()
      .references(() => sessionRuns.id, { onDelete: "cascade" }),
    summaryMd: text("summary_md").notNull(),
    reviewsScheduledCount: integer("reviews_scheduled_count")
      .notNull()
      .default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("session_summaries_run_id_unique").on(table.sessionRunId),
  ],
);
