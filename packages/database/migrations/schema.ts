import {
  bigint,
  bigserial,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const authProvider = pgEnum("auth_provider", ["GOOGLE"]);
export const chatMessageRole = pgEnum("chat_message_role", [
  "USER",
  "ASSISTANT",
  "SYSTEM",
]);
export const chatScopeType = pgEnum("chat_scope_type", [
  "SPACE",
  "PLAN",
  "SESSION",
  "CONCEPT",
]);
export const conceptDifficulty = pgEnum("concept_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
]);
export const conceptRelationType = pgEnum("concept_relation_type", [
  "RELATED",
  "PREREQUISITE",
  "SIMILAR",
  "CONTRAST",
]);
export const conceptReviewRating = pgEnum("concept_review_rating", [
  "AGAIN",
  "HARD",
  "GOOD",
  "EASY",
]);
export const conceptSessionLinkType = pgEnum("concept_session_link_type", [
  "CREATED",
  "UPDATED",
  "REVIEWED",
]);
export const materialJobStatus = pgEnum("material_job_status", [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);
export const materialJobType = pgEnum("material_job_type", [
  "TEXT_EXTRACT",
  "OUTLINE",
  "CHUNK",
  "EMBED",
  "TAG",
  "CONCEPT_CANDIDATE",
]);
export const materialProcessingStatus = pgEnum("material_processing_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);
export const materialSourceType = pgEnum("material_source_type", [
  "FILE",
  "TEXT",
]);
export const materialUploadStatus = pgEnum("material_upload_status", [
  "INITIATED",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
]);
export const outlineNodeType = pgEnum("outline_node_type", [
  "SECTION",
  "TOPIC",
]);
export const planCurrentLevel = pgEnum("plan_current_level", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);
export const planGenerationRequestStatus = pgEnum(
  "plan_generation_request_status",
  ["DRAFT", "SUBMITTED", "GENERATING", "SUCCEEDED", "FAILED", "CANCELED"],
);
export const planGoalType = pgEnum("plan_goal_type", [
  "JOB",
  "CERT",
  "WORK",
  "HOBBY",
  "OTHER",
]);
export const planSessionStatus = pgEnum("plan_session_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELED",
]);
export const planSessionType = pgEnum("plan_session_type", ["LEARN", "REVIEW"]);
export const planStatus = pgEnum("plan_status", [
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
  "COMPLETED",
]);
export const sessionActivityKind = pgEnum("session_activity_kind", [
  "EXERCISE",
  "MCQ",
  "FREEFORM",
  "CODE",
]);
export const sessionCheckinKind = pgEnum("session_checkin_kind", [
  "QUESTION",
  "SELF_ASSESSMENT",
  "BEHAVIOR_SIGNAL",
]);
export const sessionConceptRole = pgEnum("session_concept_role", [
  "NEW",
  "REVIEW",
  "PREREQ",
]);
export const sessionExitReason = pgEnum("session_exit_reason", [
  "USER_EXIT",
  "NETWORK",
  "ERROR",
  "TIMEOUT",
]);
export const sessionRunStatus = pgEnum("session_run_status", [
  "RUNNING",
  "COMPLETED",
  "ABANDONED",
]);
export const storageProvider = pgEnum("storage_provider", ["R2"]);
export const tagSource = pgEnum("tag_source", ["AI", "USER"]);
export const userStatus = pgEnum("user_status", ["ACTIVE", "DISABLED"]);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    sessionTokenHash: text("session_token_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    createdIp: text("created_ip"),
    userAgent: text("user_agent"),
    rotatedFromId: uuid("rotated_from_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("auth_sessions_expires_at_idx").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    uniqueIndex("auth_sessions_token_hash_unique").using(
      "btree",
      table.sessionTokenHash.asc().nullsLast().op("text_ops"),
    ),
    index("auth_sessions_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "auth_sessions_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    consumedAt: timestamp("consumed_at", {
      withTimezone: true,
      mode: "string",
    }),
    redirectPath: text("redirect_path").notNull(),
    createdIp: text("created_ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("magic_link_tokens_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    index("magic_link_tokens_expires_at_idx").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    uniqueIndex("magic_link_tokens_token_hash_unique").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    provider: authProvider().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessTokenEnc: text("access_token_enc"),
    refreshTokenEnc: text("refresh_token_enc"),
    scopes: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("auth_accounts_provider_account_unique").using(
      "btree",
      table.provider.asc().nullsLast().op("text_ops"),
      table.providerAccountId.asc().nullsLast().op("text_ops"),
    ),
    index("auth_accounts_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "auth_accounts_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const spaces = pgTable(
  "spaces",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id").notNull(),
    name: text().notNull(),
    description: text(),
    icon: text(),
    color: text(),
    sortOrder: integer("sort_order"),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "string",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("spaces_public_id_unique").using(
      "btree",
      table.publicId.asc().nullsLast().op("text_ops"),
    ),
    index("spaces_user_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("uuid_ops"),
    ),
    index("spaces_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "spaces_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const materialJobs = pgTable(
  "material_jobs",
  {
    id: uuid().primaryKey().notNull(),
    materialId: uuid("material_id").notNull(),
    jobType: materialJobType("job_type").notNull(),
    status: materialJobStatus().default("QUEUED").notNull(),
    progress: numeric(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
    finishedAt: timestamp("finished_at", {
      withTimezone: true,
      mode: "string",
    }),
    errorJson: jsonb("error_json"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("material_jobs_material_id_idx").using(
      "btree",
      table.materialId.asc().nullsLast().op("uuid_ops"),
    ),
    index("material_jobs_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "material_jobs_material_id_materials_id_fk",
    }).onDelete("cascade"),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("tags_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("tags_user_id_slug_unique").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.slug.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "tags_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    status: userStatus().default("ACTIVE").notNull(),
    locale: text().default("ko-KR").notNull(),
    timezone: text().default("Asia/Seoul").notNull(),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const materialChunks = pgTable(
  "material_chunks",
  {
    id: uuid().primaryKey().notNull(),
    materialId: uuid("material_id").notNull(),
    ordinal: integer().notNull(),
    content: text().notNull(),
    tokenCount: integer("token_count"),
    pageStart: integer("page_start"),
    pageEnd: integer("page_end"),
    sectionPath: text("section_path"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("material_chunks_material_id_idx").using(
      "btree",
      table.materialId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("material_chunks_material_id_ordinal_unique").using(
      "btree",
      table.materialId.asc().nullsLast().op("int4_ops"),
      table.ordinal.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "material_chunks_material_id_materials_id_fk",
    }).onDelete("cascade"),
  ],
);

export const outlineNodes = pgTable(
  "outline_nodes",
  {
    id: uuid().primaryKey().notNull(),
    materialId: uuid("material_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    parentId: uuid("parent_id"),
    nodeType: outlineNodeType("node_type").notNull(),
    title: text().notNull(),
    summary: text(),
    orderIndex: integer("order_index").notNull(),
    depth: integer().notNull(),
    path: text().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("outline_nodes_material_id_idx").using(
      "btree",
      table.materialId.asc().nullsLast().op("uuid_ops"),
    ),
    index("outline_nodes_parent_id_idx").using(
      "btree",
      table.parentId.asc().nullsLast().op("uuid_ops"),
    ),
    index("outline_nodes_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "outline_nodes_material_id_materials_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "outline_nodes_space_id_spaces_id_fk",
    }).onDelete("cascade"),
  ],
);

export const planGenerationRequests = pgTable(
  "plan_generation_requests",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    status: planGenerationRequestStatus().default("DRAFT").notNull(),
    goalType: planGoalType("goal_type").notNull(),
    goalText: text("goal_text"),
    currentLevel: planCurrentLevel("current_level").notNull(),
    targetDueDate: date("target_due_date").notNull(),
    specialRequirements: text("special_requirements"),
    previewJson: jsonb("preview_json"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("plan_generation_requests_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    index("plan_generation_requests_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "plan_generation_requests_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "plan_generation_requests_space_id_spaces_id_fk",
    }).onDelete("cascade"),
  ],
);

export const materials = pgTable(
  "materials",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    sourceType: materialSourceType("source_type").notNull(),
    title: text().notNull(),
    originalFilename: text("original_filename"),
    sourceUrl: text("source_url"),
    rawText: text("raw_text"),
    storageProvider: storageProvider("storage_provider").default("R2"),
    storageKey: text("storage_key"),
    mimeType: text("mime_type"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    fileSize: bigint("file_size", { mode: "number" }),
    checksum: text(),
    processingStatus: materialProcessingStatus("processing_status")
      .default("PENDING")
      .notNull(),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      mode: "string",
    }),
    summary: text(),
    errorMessage: text("error_message"),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("materials_processing_status_space_id_idx").using(
      "btree",
      table.processingStatus.asc().nullsLast().op("int8_ops"),
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    index("materials_space_id_created_at_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("materials_space_id_not_deleted_idx")
      .using("btree", table.spaceId.asc().nullsLast().op("int8_ops"))
      .where(sql`(deleted_at IS NULL)`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "materials_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "materials_space_id_spaces_id_fk",
    }).onDelete("cascade"),
  ],
);

export const planSessions = pgTable(
  "plan_sessions",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    planId: bigint("plan_id", { mode: "number" }).notNull(),
    moduleId: uuid("module_id"),
    sessionType: planSessionType("session_type").notNull(),
    title: text().notNull(),
    objective: text(),
    orderIndex: integer("order_index").notNull(),
    scheduledForDate: date("scheduled_for_date").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    status: planSessionStatus().default("SCHEDULED").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("plan_sessions_plan_id_idx").using(
      "btree",
      table.planId.asc().nullsLast().op("int8_ops"),
    ),
    index("plan_sessions_plan_id_status_idx").using(
      "btree",
      table.planId.asc().nullsLast().op("int8_ops"),
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    uniqueIndex("plan_sessions_public_id_unique").using(
      "btree",
      table.publicId.asc().nullsLast().op("text_ops"),
    ),
    index("plan_sessions_scheduled_for_date_idx").using(
      "btree",
      table.scheduledForDate.asc().nullsLast().op("date_ops"),
    ),
    foreignKey({
      columns: [table.planId],
      foreignColumns: [plans.id],
      name: "plan_sessions_plan_id_plans_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.moduleId],
      foreignColumns: [planModules.id],
      name: "plan_sessions_module_id_plan_modules_id_fk",
    }).onDelete("set null"),
  ],
);

export const sessionCheckins = pgTable(
  "session_checkins",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" }).notNull(),
    kind: sessionCheckinKind().notNull(),
    prompt: text().notNull(),
    responseJson: jsonb("response_json"),
    recordedAt: timestamp("recorded_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("session_checkins_run_id_idx").using(
      "btree",
      table.sessionRunId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "session_checkins_session_run_id_session_runs_id_fk",
    }).onDelete("cascade"),
  ],
);

export const sessionProgressSnapshots = pgTable(
  "session_progress_snapshots",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" }).notNull(),
    stepIndex: integer("step_index").notNull(),
    payloadJson: jsonb("payload_json").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("session_progress_snapshots_run_id_idx").using(
      "btree",
      table.sessionRunId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "session_progress_snapshots_session_run_id_session_runs_id_fk",
    }).onDelete("cascade"),
  ],
);

export const sessionSummaries = pgTable(
  "session_summaries",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" }).notNull(),
    summaryMd: text("summary_md").notNull(),
    conceptsCreatedCount: integer("concepts_created_count")
      .default(0)
      .notNull(),
    conceptsUpdatedCount: integer("concepts_updated_count")
      .default(0)
      .notNull(),
    reviewsScheduledCount: integer("reviews_scheduled_count")
      .default(0)
      .notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("session_summaries_run_id_unique").using(
      "btree",
      table.sessionRunId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "session_summaries_session_run_id_session_runs_id_fk",
    }).onDelete("cascade"),
  ],
);

export const sessionRuns = pgTable(
  "session_runs",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionId: bigint("session_id", { mode: "number" }).notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    planId: bigint("plan_id", { mode: "number" }).notNull(),
    status: sessionRunStatus().notNull(),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "string" }),
    exitReason: sessionExitReason("exit_reason"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    idempotencyKey: uuid("idempotency_key"),
  },
  (table) => [
    uniqueIndex("session_runs_public_id_unique").using(
      "btree",
      table.publicId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("session_runs_running_unique")
      .using("btree", table.sessionId.asc().nullsLast().op("int8_ops"))
      .where(sql`(status = 'RUNNING'::session_run_status)`),
    index("session_runs_session_id_idx").using(
      "btree",
      table.sessionId.asc().nullsLast().op("int8_ops"),
    ),
    index("session_runs_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("session_runs_user_idempotency_key_unique").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.idempotencyKey.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [planSessions.id],
      name: "session_runs_session_id_plan_sessions_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "session_runs_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "session_runs_space_id_spaces_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.planId],
      foreignColumns: [plans.id],
      name: "session_runs_plan_id_plans_id_fk",
    }).onDelete("cascade"),
  ],
);

export const plans = pgTable(
  "plans",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    generationRequestId: uuid("generation_request_id"),
    title: text().notNull(),
    status: planStatus().default("PAUSED").notNull(),
    goalType: planGoalType("goal_type").notNull(),
    goalText: text("goal_text"),
    currentLevel: planCurrentLevel("current_level").notNull(),
    targetDueDate: date("target_due_date").notNull(),
    specialRequirements: text("special_requirements"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "string",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("plans_one_active_per_space_unique")
      .using("btree", table.spaceId.asc().nullsLast().op("int8_ops"))
      .where(sql`(status = 'ACTIVE'::plan_status)`),
    uniqueIndex("plans_public_id_unique").using(
      "btree",
      table.publicId.asc().nullsLast().op("text_ops"),
    ),
    index("plans_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    index("plans_space_id_status_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("enum_ops"),
      table.status.asc().nullsLast().op("int8_ops"),
    ),
    index("plans_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "plans_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "plans_space_id_spaces_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.generationRequestId],
      foreignColumns: [planGenerationRequests.id],
      name: "plans_generation_request_id_plan_generation_requests_id_fk",
    }).onDelete("set null"),
  ],
);

export const planModules = pgTable(
  "plan_modules",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    planId: bigint("plan_id", { mode: "number" }).notNull(),
    title: text().notNull(),
    description: text(),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("plan_modules_plan_id_idx").using(
      "btree",
      table.planId.asc().nullsLast().op("int8_ops"),
    ),
    uniqueIndex("plan_modules_plan_id_order_index_unique").using(
      "btree",
      table.planId.asc().nullsLast().op("int4_ops"),
      table.orderIndex.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.planId],
      foreignColumns: [plans.id],
      name: "plan_modules_plan_id_plans_id_fk",
    }).onDelete("cascade"),
  ],
);

export const conceptReviews = pgTable(
  "concept_reviews",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conceptId: bigint("concept_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" }),
    rating: conceptReviewRating().notNull(),
    reviewedAt: timestamp("reviewed_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    nextDueAt: timestamp("next_due_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    intervalDays: integer("interval_days").notNull(),
    easeFactor: numeric("ease_factor").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("concept_reviews_concept_id_idx").using(
      "btree",
      table.conceptId.asc().nullsLast().op("int8_ops"),
    ),
    index("concept_reviews_reviewed_at_idx").using(
      "btree",
      table.reviewedAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.conceptId],
      foreignColumns: [concepts.id],
      name: "concept_reviews_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "concept_reviews_session_run_id_session_runs_id_fk",
    }).onDelete("set null"),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid().primaryKey().notNull(),
    threadId: uuid("thread_id").notNull(),
    role: chatMessageRole().notNull(),
    contentMd: text("content_md").notNull(),
    tokenCount: integer("token_count"),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("chat_messages_thread_id_created_at_idx").using(
      "btree",
      table.threadId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.threadId],
      foreignColumns: [chatThreads.id],
      name: "chat_messages_thread_id_chat_threads_id_fk",
    }).onDelete("cascade"),
  ],
);

export const conceptRelations = pgTable(
  "concept_relations",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    fromConceptId: bigint("from_concept_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    toConceptId: bigint("to_concept_id", { mode: "number" }).notNull(),
    relationType: conceptRelationType("relation_type").notNull(),
    weight: numeric(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("concept_relations_from_idx").using(
      "btree",
      table.fromConceptId.asc().nullsLast().op("int8_ops"),
    ),
    index("concept_relations_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "concept_relations_space_id_spaces_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.fromConceptId],
      foreignColumns: [concepts.id],
      name: "concept_relations_from_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.toConceptId],
      foreignColumns: [concepts.id],
      name: "concept_relations_to_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
  ],
);

export const concepts = pgTable(
  "concepts",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    title: text().notNull(),
    oneLiner: text("one_liner").notNull(),
    ariNoteMd: text("ari_note_md").notNull(),
    difficulty: conceptDifficulty(),
    lastLearnedAt: timestamp("last_learned_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastReviewedAt: timestamp("last_reviewed_at", {
      withTimezone: true,
      mode: "string",
    }),
    srsDueAt: timestamp("srs_due_at", { withTimezone: true, mode: "string" }),
    srsStateJson: jsonb("srs_state_json"),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("concepts_public_id_unique").using(
      "btree",
      table.publicId.asc().nullsLast().op("text_ops"),
    ),
    index("concepts_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    index("concepts_space_id_title_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
      table.title.asc().nullsLast().op("text_ops"),
    ),
    index("concepts_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "concepts_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "concepts_space_id_spaces_id_fk",
    }).onDelete("cascade"),
  ],
);

export const domainEvents = pgTable(
  "domain_events",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }),
    eventType: text("event_type").notNull(),
    payloadJson: jsonb("payload_json"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("domain_events_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    index("domain_events_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

export const materialEmbeddings = pgTable(
  "material_embeddings",
  {
    id: uuid().primaryKey().notNull(),
    chunkId: uuid("chunk_id").notNull(),
    model: text().notNull(),
    vector: vector({ dimensions: 1536 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("material_embeddings_chunk_id_idx").using(
      "btree",
      table.chunkId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.chunkId],
      foreignColumns: [materialChunks.id],
      name: "material_embeddings_chunk_id_material_chunks_id_fk",
    }).onDelete("cascade"),
  ],
);

export const sessionActivities = pgTable(
  "session_activities",
  {
    id: uuid().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" }).notNull(),
    kind: sessionActivityKind().notNull(),
    prompt: text().notNull(),
    userAnswer: text("user_answer"),
    aiEvalJson: jsonb("ai_eval_json"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("session_activities_run_id_idx").using(
      "btree",
      table.sessionRunId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "session_activities_session_run_id_session_runs_id_fk",
    }).onDelete("cascade"),
  ],
);

export const chatCitations = pgTable(
  "chat_citations",
  {
    id: uuid().primaryKey().notNull(),
    messageId: uuid("message_id").notNull(),
    chunkId: uuid("chunk_id").notNull(),
    score: numeric(),
    quote: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("chat_citations_message_id_idx").using(
      "btree",
      table.messageId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [chatMessages.id],
      name: "chat_citations_message_id_chat_messages_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.chunkId],
      foreignColumns: [materialChunks.id],
      name: "chat_citations_chunk_id_material_chunks_id_fk",
    }).onDelete("cascade"),
  ],
);

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    scopeType: chatScopeType("scope_type").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    scopeId: bigint("scope_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("chat_threads_space_id_idx").using(
      "btree",
      table.spaceId.asc().nullsLast().op("int8_ops"),
    ),
    index("chat_threads_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "chat_threads_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "chat_threads_space_id_spaces_id_fk",
    }).onDelete("cascade"),
  ],
);

export const coachMessages = pgTable(
  "coach_messages",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    date: date().notNull(),
    contentMd: text("content_md").notNull(),
    contextJson: jsonb("context_json"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("coach_messages_user_date_unique").using(
      "btree",
      table.userId.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("date_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "coach_messages_user_id_users_id_fk",
    }).onDelete("cascade"),
  ],
);

export const materialUploads = pgTable(
  "material_uploads",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    spaceId: bigint("space_id", { mode: "number" }).notNull(),
    status: materialUploadStatus().default("INITIATED").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
    errorMessage: text("error_message"),
    objectKey: text("object_key").notNull(),
    finalObjectKey: text("final_object_key"),
    originalFilename: text("original_filename"),
    mimeType: text("mime_type").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    etag: text(),
    materialId: uuid("material_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("material_uploads_expires_at_idx").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("material_uploads_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    index("material_uploads_user_space_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.spaceId.asc().nullsLast().op("uuid_ops"),
      table.createdAt.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "material_uploads_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.spaceId],
      foreignColumns: [spaces.id],
      name: "material_uploads_space_id_spaces_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "material_uploads_material_id_materials_id_fk",
    }).onDelete("set null"),
  ],
);

export const ragCollections = pgTable(
  "rag_collections",
  {
    uuid: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar(),
    cmetadata: jsonb(),
  },
  (table) => [
    index("idx_rag_collections_name").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const ragDocuments = pgTable(
  "rag_documents",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    content: text(),
    metadata: jsonb(),
    vector: vector(),
    collectionId: uuid("collection_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.collectionId],
      foreignColumns: [ragCollections.uuid],
      name: "rag_documents_collection_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const conceptTopicLinks = pgTable(
  "concept_topic_links",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conceptId: bigint("concept_id", { mode: "number" }).notNull(),
    outlineNodeId: uuid("outline_node_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("concept_topic_links_concept_id_idx").using(
      "btree",
      table.conceptId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.conceptId],
      foreignColumns: [concepts.id],
      name: "concept_topic_links_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.outlineNodeId],
      foreignColumns: [outlineNodes.id],
      name: "concept_topic_links_outline_node_id_outline_nodes_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.conceptId, table.outlineNodeId],
      name: "concept_topic_links_concept_id_outline_node_id_pk",
    }),
  ],
);

export const conceptSessionLinks = pgTable(
  "concept_session_links",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conceptId: bigint("concept_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" }).notNull(),
    linkType: conceptSessionLinkType("link_type").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("concept_session_links_concept_id_idx").using(
      "btree",
      table.conceptId.asc().nullsLast().op("int8_ops"),
    ),
    index("concept_session_links_run_id_idx").using(
      "btree",
      table.sessionRunId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.conceptId],
      foreignColumns: [concepts.id],
      name: "concept_session_links_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "concept_session_links_session_run_id_session_runs_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.conceptId, table.sessionRunId, table.linkType],
      name: "concept_session_links_concept_id_session_run_id_link_type_pk",
    }),
  ],
);

export const planGenerationRequestMaterials = pgTable(
  "plan_generation_request_materials",
  {
    requestId: uuid("request_id").notNull(),
    materialId: uuid("material_id").notNull(),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("plan_generation_request_materials_request_id_idx").using(
      "btree",
      table.requestId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "plan_generation_request_materials_material_id_materials_id_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [planGenerationRequests.id],
      name: "plan_generation_request_materials_request_id_plan_generation_re",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.requestId, table.materialId],
      name: "plan_generation_request_materials_request_id_material_id_pk",
    }),
  ],
);

export const materialTags = pgTable(
  "material_tags",
  {
    materialId: uuid("material_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    source: tagSource().notNull(),
    confidence: numeric(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("material_tags_material_id_idx").using(
      "btree",
      table.materialId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "material_tags_material_id_materials_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "material_tags_tag_id_tags_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.materialId, table.tagId],
      name: "material_tags_material_id_tag_id_pk",
    }),
  ],
);

export const planSourceMaterials = pgTable(
  "plan_source_materials",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    planId: bigint("plan_id", { mode: "number" }).notNull(),
    materialId: uuid("material_id").notNull(),
    materialTitleSnapshot: text("material_title_snapshot"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("plan_source_materials_material_id_idx").using(
      "btree",
      table.materialId.asc().nullsLast().op("uuid_ops"),
    ),
    index("plan_source_materials_plan_id_idx").using(
      "btree",
      table.planId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.planId],
      foreignColumns: [plans.id],
      name: "plan_source_materials_plan_id_plans_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "plan_source_materials_material_id_materials_id_fk",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.planId, table.materialId],
      name: "plan_source_materials_plan_id_material_id_pk",
    }),
  ],
);

export const conceptTags = pgTable(
  "concept_tags",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conceptId: bigint("concept_id", { mode: "number" }).notNull(),
    tagId: uuid("tag_id").notNull(),
    source: tagSource().notNull(),
    confidence: numeric(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("concept_tags_concept_id_idx").using(
      "btree",
      table.conceptId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.conceptId],
      foreignColumns: [concepts.id],
      name: "concept_tags_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "concept_tags_tag_id_tags_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.conceptId, table.tagId],
      name: "concept_tags_concept_id_tag_id_pk",
    }),
  ],
);

export const sessionConcepts = pgTable(
  "session_concepts",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionId: bigint("session_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    conceptId: bigint("concept_id", { mode: "number" }).notNull(),
    role: sessionConceptRole().notNull(),
    weight: numeric(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("session_concepts_session_id_idx").using(
      "btree",
      table.sessionId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [planSessions.id],
      name: "session_concepts_session_id_plan_sessions_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.conceptId],
      foreignColumns: [concepts.id],
      name: "session_concepts_concept_id_concepts_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.sessionId, table.conceptId],
      name: "session_concepts_session_id_concept_id_pk",
    }),
  ],
);
