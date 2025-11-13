import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ========== Auth: 인증 ========== */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

/* ========== LearningPlan: 학습 계획 ========== */

export const learningPlan = pgTable("learning_plan", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 16 }).notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, archived
  emoji: varchar("emoji", { length: 16 }).notNull().default("📚"),

  // 개인화 정보
  learningTopic: text("learning_topic").notNull(),
  userLevel: text("user_level").notNull(), // 초보자, 기초, 중급, 고급, 전문가
  targetWeeks: integer("target_weeks").notNull(), // 1-24주
  weeklyHours: integer("weekly_hours").notNull(), // 1-60시간
  learningStyle: text("learning_style").notNull(), // 시각적 학습, 실습 중심, 문서 읽기 등
  preferredResources: text("preferred_resources").notNull(), // 온라인 강의, 책, 튜토리얼 등
  mainGoal: text("main_goal").notNull(),
  additionalRequirements: text("additional_requirements"),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ========== LearningModule: 학습 모듈 ========== */

export const learningModule = pgTable("learning_module", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique(),
  learningPlanId: integer("learning_plan_id")
    .notNull()
    .references(() => learningPlan.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  isExpanded: boolean("is_expanded").default(true).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ========== LearningTask: 학습 태스크 ========== */

export const learningTask = pgTable("learning_task", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique(),
  learningModuleId: integer("learning_module_id")
    .notNull()
    .references(() => learningModule.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  memo: text("memo"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const aiNote = pgTable(
  "ai_note",
  {
    id: serial("id").primaryKey(),
    learningTaskId: integer("learning_task_id")
      .notNull()
      .references(() => learningTask.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("idle"),
    markdown: text("markdown"),
    requestedAt: timestamp("requested_at"),
    completedAt: timestamp("completed_at"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("ai_note_learning_task_id_idx").on(table.learningTaskId),
    index("ai_note_status_idx").on(table.status),
  ],
);

/* ========== AI Quiz: 학습 퀴즈 ========== */

export const aiQuiz = pgTable(
  "ai_quiz",
  {
    id: serial("id").primaryKey(),
    learningTaskId: integer("learning_task_id")
      .notNull()
      .references(() => learningTask.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("idle"),
    questions: jsonb("questions"),
    targetQuestionCount: integer("target_question_count").notNull().default(4),
    totalQuestions: integer("total_questions"),
    requestedAt: timestamp("requested_at"),
    completedAt: timestamp("completed_at"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ai_quiz_learning_task_id_idx").on(table.learningTaskId),
    index("ai_quiz_status_idx").on(table.status),
  ],
);

export const aiQuizResult = pgTable(
  "ai_quiz_result",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => aiQuiz.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    totalQuestions: integer("total_questions").notNull(),
    correctCount: integer("correct_count").notNull(),
    answers: jsonb("answers").notNull(),
    submittedAt: timestamp("submitted_at")
      .$defaultFn(() => new Date())
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ai_quiz_result_quiz_id_idx").on(table.quizId),
    index("ai_quiz_result_user_id_idx").on(table.userId),
  ],
);

/* ========== LearningPlanDocument: 학습 계획 문서 ========== */

export const learningPlanDocument = pgTable("learning_plan_document", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),

  // 관계
  learningPlanId: integer("learning_plan_id").references(
    () => learningPlan.id,
    {
      onDelete: "cascade",
    },
  ),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // 파일 정보
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),

  // R2 저장 정보
  storageKey: text("storage_key").notNull(),
  storageUrl: text("storage_url").notNull(),

  // 타임스탬프
  uploadedAt: timestamp("uploaded_at")
    .$defaultFn(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

/* ========== AI Chat: AI 튜터 채팅 ========== */

export const aiConversation = pgTable(
  "ai_conversation",
  {
    id: text("id").primaryKey(),
    learningPlanId: integer("learning_plan_id")
      .notNull()
      .references(() => learningPlan.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ai_conversation_learning_plan_id_idx").on(table.learningPlanId),
    index("ai_conversation_user_id_idx").on(table.userId),
  ],
);

export const aiMessage = pgTable(
  "ai_message",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => aiConversation.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant' | 'tool'
    content: text("content").notNull(),
    toolInvocations: jsonb("tool_invocations"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ai_message_conversation_id_created_at_idx").on(
      table.conversationId,
      table.createdAt.desc(),
    ),
  ],
);
