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
export const chatScopeType = pgEnum("chat_scope_type", ["PLAN", "SESSION"]);
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
export const planSessionType = pgEnum("plan_session_type", ["LEARN"]);
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
export const subscriptionPlan = pgEnum("subscription_plan", ["FREE", "PRO"]);
export const userStatus = pgEnum("user_status", ["ACTIVE", "DISABLED"]);

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    scopeType: chatScopeType("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
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
    index("chat_threads_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "chat_threads_user_id_users_id_fk",
    }).onDelete("cascade"),
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

export const domainEvents = pgTable(
  "domain_events",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id"),
    eventType: text("event_type").notNull(),
    payloadJson: jsonb("payload_json"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("domain_events_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

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
    subscriptionPlan: subscriptionPlan("subscription_plan")
      .default("FREE")
      .notNull(),
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

export const materialUploads = pgTable(
  "material_uploads",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
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
    index("material_uploads_user_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "material_uploads_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "material_uploads_material_id_materials_id_fk",
    }).onDelete("set null"),
  ],
);

export const planGenerationRequests = pgTable(
  "plan_generation_requests",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
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
    index("plan_generation_requests_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "plan_generation_requests_user_id_users_id_fk",
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

export const materials = pgTable(
  "materials",
  {
    id: uuid().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
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
    index("materials_user_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("materials_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("materials_user_id_not_deleted_idx")
      .using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
      .where(sql`(deleted_at IS NULL)`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "materials_user_id_users_id_fk",
    }).onDelete("cascade"),
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

export const plans = pgTable(
  "plans",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    userId: uuid("user_id").notNull(),
    generationRequestId: uuid("generation_request_id"),
    title: text().notNull(),
    icon: text().default("target").notNull(),
    color: text().default("blue").notNull(),
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
    uniqueIndex("plans_one_active_per_user_unique")
      .using("btree", table.userId.asc().nullsLast().op("uuid_ops"))
      .where(sql`(status = 'ACTIVE'::plan_status)`),
    uniqueIndex("plans_public_id_unique").using(
      "btree",
      table.publicId.asc().nullsLast().op("text_ops"),
    ),
    index("plans_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("plans_user_id_status_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.status.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "plans_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.generationRequestId],
      foreignColumns: [planGenerationRequests.id],
      name: "plans_generation_request_id_plan_generation_requests_id_fk",
    }).onDelete("set null"),
  ],
);

export const outlineNodes = pgTable(
  "outline_nodes",
  {
    id: uuid().primaryKey().notNull(),
    materialId: uuid("material_id").notNull(),
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
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "outline_nodes_material_id_materials_id_fk",
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

export const sessionRuns = pgTable(
  "session_runs",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    publicId: varchar("public_id", { length: 12 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionId: bigint("session_id", { mode: "number" }).notNull(),
    userId: uuid("user_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    planId: bigint("plan_id", { mode: "number" }).notNull(),
    idempotencyKey: uuid("idempotency_key"),
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
      columns: [table.planId],
      foreignColumns: [plans.id],
      name: "session_runs_plan_id_plans_id_fk",
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

export const sessionRunBlueprints = pgTable(
  "session_run_blueprints",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    sessionRunId: bigint("session_run_id", { mode: "number" })
      .primaryKey()
      .notNull(),
    schemaVersion: integer("schema_version").notNull(),
    blueprintJson: jsonb("blueprint_json").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("session_run_blueprints_run_id_idx").using(
      "btree",
      table.sessionRunId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.sessionRunId],
      foreignColumns: [sessionRuns.id],
      name: "session_run_blueprints_session_run_id_session_runs_id_fk",
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
    vector: vector({ dimensions: 1536 }),
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
      columns: [table.requestId],
      foreignColumns: [planGenerationRequests.id],
      name: "plan_generation_request_materials_request_id_plan_generation_re",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.materialId],
      foreignColumns: [materials.id],
      name: "plan_generation_request_materials_material_id_materials_id_fk",
    }).onDelete("restrict"),
    primaryKey({
      columns: [table.requestId, table.materialId],
      name: "plan_generation_request_materials_request_id_material_id_pk",
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
