import { z } from "zod";

export const UuidSchema = z.string().uuid();
export const IsoDateTimeSchema = z.string().datetime();
export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid ISO date (YYYY-MM-DD)");

export const UserSchema = z.object({
  id: UuidSchema,
  name: z.string().min(1).max(50),
  email: z.string().email(),
  plan: z.enum(["free", "pro", "team"]).default("free"),
});
export type User = z.infer<typeof UserSchema>;

export const SpaceSchema = z.object({
  id: UuidSchema,
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200).optional(),
  icon: z.string().min(1).max(50).default("book"),
  color: z.string().min(1).max(20).default("blue"),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  activePlanId: UuidSchema.optional(),
});
export type Space = z.infer<typeof SpaceSchema>;

export const DocumentKindSchema = z.enum(["file", "url", "text"]);
export type DocumentKind = z.infer<typeof DocumentKindSchema>;

export const DocumentStatusSchema = z.enum([
  "pending",
  "analyzing",
  "completed",
  "error",
]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const DocumentSourceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("file"),
    fileName: z.string().min(1).max(120),
    fileSizeBytes: z.number().int().nonnegative().optional(),
  }),
  z.object({
    type: z.literal("url"),
    url: z.string().url(),
  }),
  z.object({
    type: z.literal("text"),
    textPreview: z.string().min(1).max(200),
  }),
]);
export type DocumentSource = z.infer<typeof DocumentSourceSchema>;

export const DocumentSchema = z.object({
  id: UuidSchema,
  spaceId: UuidSchema,
  title: z.string().min(1).max(120),
  kind: DocumentKindSchema,
  status: DocumentStatusSchema,
  summary: z.string().min(1).max(280).optional(),
  tags: z.array(z.string().min(1).max(24)).max(8),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  analysisReadyAt: IsoDateTimeSchema.optional(),
  source: DocumentSourceSchema.optional(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const PlanStatusSchema = z.enum(["active", "paused", "archived"]);
export type PlanStatus = z.infer<typeof PlanStatusSchema>;

export const PlanGoalSchema = z.enum([
  "career",
  "certificate",
  "work",
  "hobby",
]);
export type PlanGoal = z.infer<typeof PlanGoalSchema>;

export const PlanLevelSchema = z.enum([
  "novice",
  "basic",
  "intermediate",
  "advanced",
]);
export type PlanLevel = z.infer<typeof PlanLevelSchema>;

export const PlanSessionTypeSchema = z.enum(["session", "review"]);
export type PlanSessionType = z.infer<typeof PlanSessionTypeSchema>;

export const PlanSessionStatusSchema = z.enum([
  "todo",
  "in_progress",
  "completed",
]);
export type PlanSessionStatus = z.infer<typeof PlanSessionStatusSchema>;

export const PlanSessionSchema = z.object({
  id: UuidSchema,
  moduleId: UuidSchema,
  blueprintId: UuidSchema,
  title: z.string().min(1).max(120),
  type: PlanSessionTypeSchema,
  scheduledDate: IsoDateSchema,
  durationMinutes: z.number().int().min(5).max(120),
  status: PlanSessionStatusSchema,
  completedAt: IsoDateTimeSchema.optional(),
  conceptIds: z.array(UuidSchema).default([]),
});
export type PlanSession = z.infer<typeof PlanSessionSchema>;

export const PlanModuleSchema = z.object({
  id: UuidSchema,
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(240).optional(),
  sessions: z.array(PlanSessionSchema).min(1),
});
export type PlanModule = z.infer<typeof PlanModuleSchema>;

export const PlanSchema = z.object({
  id: UuidSchema,
  spaceId: UuidSchema,
  title: z.string().min(1).max(80),
  goal: PlanGoalSchema,
  level: PlanLevelSchema,
  status: PlanStatusSchema,
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  sourceDocumentIds: z.array(UuidSchema).min(1).max(5),
  modules: z.array(PlanModuleSchema).min(1),
});
export type Plan = z.infer<typeof PlanSchema>;

export const ConceptReviewStatusSchema = z.enum(["good", "soon", "due"]);
export type ConceptReviewStatus = z.infer<typeof ConceptReviewStatusSchema>;

export const ConceptSchema = z.object({
  id: UuidSchema,
  spaceId: UuidSchema,
  title: z.string().min(1).max(120),
  oneLiner: z.string().min(1).max(200),
  definition: z.string().min(1).max(2_000),
  exampleCode: z.string().min(1).max(2_000).optional(),
  gotchas: z.array(z.string().min(1).max(200)).max(8).default([]),
  tags: z.array(z.string().min(1).max(24)).max(8).default([]),
  reviewStatus: ConceptReviewStatusSchema,
  lastStudiedAt: IsoDateTimeSchema,
  sources: z
    .array(
      z.object({
        planId: UuidSchema,
        sessionId: UuidSchema,
        moduleTitle: z.string().min(1).max(120),
        sessionTitle: z.string().min(1).max(120),
        studiedAt: IsoDateTimeSchema,
      }),
    )
    .min(1),
  relatedConceptIds: z.array(UuidSchema).max(8).default([]),
});
export type Concept = z.infer<typeof ConceptSchema>;

export const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

// === 세션 스텝 타입 정의 ===
// 새로운 학습 플로우: 인트로 → 개념학습 → 이해도체크 → 적용활동 → 요약

export const SessionStepTypeSchema = z.enum([
  // 고정 스텝
  "SESSION_INTRO", // 세션 인트로 (항상 첫 번째)
  "SESSION_SUMMARY", // 세션 요약 (항상 마지막)
  // 개념 학습
  "CONCEPT", // 마크다운 기반 개념 설명 (챕터 분리 가능)
  // 이해도 체크 (키보드 입력 없이 클릭만으로)
  "CHECK", // 4지선다 퀴즈
  "CLOZE", // 빈칸 맞히기 (4지선다)
  "MATCHING", // 짝끼리 연결
  "FLASHCARD", // 플래시카드
  "SPEED_OX", // 스피드 O/X
  // 적용 활동
  "APPLICATION", // 짧은 실습/적용 문제
]);
export type SessionStepType = z.infer<typeof SessionStepTypeSchema>;

export const SessionStepIdSchema = z.string().min(1).max(80);
export type SessionStepId = z.infer<typeof SessionStepIdSchema>;

export const SessionStepIntentSchema = z.enum([
  "INTRO",
  "EXPLAIN",
  "RETRIEVAL",
  "PRACTICE",
  "WRAPUP",
]);
export type SessionStepIntent = z.infer<typeof SessionStepIntentSchema>;

export const SessionStepGatingSchema = z.object({
  required: z.boolean().optional(),
  when: z.string().min(1).max(200).optional(),
});
export type SessionStepGating = z.infer<typeof SessionStepGatingSchema>;

export const SessionStepNextSchema = z.union([
  z.object({ default: SessionStepIdSchema }),
  z.object({
    branches: z
      .array(
        z.object({
          when: z.string().min(1).max(200),
          to: SessionStepIdSchema,
        }),
      )
      .min(1),
  }),
]);
export type SessionStepNext = z.infer<typeof SessionStepNextSchema>;

const SessionStepBaseSchema = z.object({
  id: SessionStepIdSchema,
  estimatedSeconds: z
    .number()
    .int()
    .positive()
    .max(60 * 60)
    .optional(),
  intent: SessionStepIntentSchema.optional(),
  gating: SessionStepGatingSchema.optional(),
  next: SessionStepNextSchema.optional(),
});

export const SessionStepSchema = z.discriminatedUnion("type", [
  // === 1. 세션 인트로 (첫번째 고정) ===
  SessionStepBaseSchema.extend({
    type: z.literal("SESSION_INTRO"),
    planTitle: z.string().min(1).max(120),
    moduleTitle: z.string().min(1).max(120),
    sessionTitle: z.string().min(1).max(120),
    durationMinutes: z.number().int().min(1).max(180),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    learningGoals: z.array(z.string().min(1).max(200)).min(1).max(5),
    questionsToCover: z.array(z.string().min(1).max(200)).min(1).max(5),
    prerequisites: z.array(z.string().min(1).max(100)).max(5).default([]),
  }),

  // === 2. 개념 학습 (마크다운 지원, 챕터 분리) ===
  SessionStepBaseSchema.extend({
    type: z.literal("CONCEPT"),
    title: z.string().min(1).max(120),
    content: z.string().min(1).max(10_000), // 마크다운 (mermaid 포함)
    chapterIndex: z.number().int().min(1).optional(), // 현재 챕터 번호
    totalChapters: z.number().int().min(1).optional(), // 전체 챕터 수
  }),

  // === 3. 이해도 체크 ===
  // 4지선다 퀴즈
  SessionStepBaseSchema.extend({
    type: z.literal("CHECK"),
    question: z.string().min(1).max(500),
    options: z.array(z.string().min(1).max(200)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    explanation: z.string().max(500).optional(),
  }),

  // 빈칸 맞히기 (4지선다 Cloze)
  SessionStepBaseSchema.extend({
    type: z.literal("CLOZE"),
    sentence: z.string().min(1).max(500), // "React의 {{blank}}는 상태를 관리합니다."
    blankId: z.string().min(1).max(50),
    options: z.array(z.string().min(1).max(100)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    explanation: z.string().max(500).optional(),
  }),

  // 짝끼리 연결
  SessionStepBaseSchema.extend({
    type: z.literal("MATCHING"),
    instruction: z.string().min(1).max(200),
    pairs: z
      .array(
        z.object({
          id: z.string().min(1).max(50),
          left: z.string().min(1).max(100),
          right: z.string().min(1).max(100),
        }),
      )
      .min(2)
      .max(6),
  }),

  // 플래시카드
  SessionStepBaseSchema.extend({
    type: z.literal("FLASHCARD"),
    front: z.string().min(1).max(500),
    back: z.string().min(1).max(1_000),
  }),

  // 스피드 O/X
  SessionStepBaseSchema.extend({
    type: z.literal("SPEED_OX"),
    statement: z.string().min(1).max(300),
    isTrue: z.boolean(),
    explanation: z.string().max(500).optional(),
  }),

  // === 4. 적용 활동 ===
  SessionStepBaseSchema.extend({
    type: z.literal("APPLICATION"),
    scenario: z.string().min(1).max(1_000), // 상황 설명
    question: z.string().min(1).max(500), // 질문
    options: z.array(z.string().min(1).max(300)).min(2).max(4), // 선택지
    correctIndex: z.number().int().min(0).max(3),
    feedback: z.string().max(500).optional(), // 정답 선택 후 피드백
  }),

  // === 5. 세션 요약 (마지막 고정) ===
  SessionStepBaseSchema.extend({
    type: z.literal("SESSION_SUMMARY"),
    celebrationEmoji: z.string().min(1).max(10).default("🎉"),
    encouragement: z.string().min(1).max(200),
    studyTimeMinutes: z.number().int().min(0).optional(), // 런타임에 계산
    savedConceptCount: z.number().int().min(0).optional(), // 런타임에 계산
    completedActivities: z
      .array(z.string().min(1).max(100))
      .max(10)
      .default([]),
    keyTakeaways: z.array(z.string().min(1).max(200)).min(1).max(5),
    nextSessionPreview: z
      .object({
        title: z.string().min(1).max(120),
        description: z.string().max(200).optional(),
      })
      .optional(),
  }),
]);
export type SessionStep = z.infer<typeof SessionStepSchema>;

export const SessionBlueprintSchema = z.object({
  schemaVersion: z.number().int().positive(),
  blueprintId: UuidSchema,
  createdAt: IsoDateTimeSchema,
  context: z.object({
    planId: UuidSchema,
    moduleId: UuidSchema,
    planSessionId: UuidSchema,
    sessionType: PlanSessionTypeSchema,
  }),
  timeBudget: z.object({
    targetMinutes: z.number().int().min(1).max(180),
    minMinutes: z.number().int().min(1).max(180),
    maxMinutes: z.number().int().min(1).max(180),
    profile: z.enum(["MICRO", "STANDARD", "DEEP"]),
  }),
  steps: z.array(SessionStepSchema).min(1),
  startStepId: SessionStepIdSchema,
});
export type SessionBlueprint = z.infer<typeof SessionBlueprintSchema>;

// === 세션 템플릿 (구조 패턴 정의) ===

export const SessionTemplateCategorySchema = z.enum([
  "micro", // 3-7분 마이크로 세션
  "standard", // 15-25분 표준 세션
  "deep", // 30-60분 심화 세션
  "review", // 복습 세션
  "assessment", // 평가 세션
]);
export type SessionTemplateCategory = z.infer<
  typeof SessionTemplateCategorySchema
>;

export const SessionTemplateSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  category: SessionTemplateCategorySchema,
  estimatedMinutes: z.object({
    min: z.number().int().min(1),
    max: z.number().int().max(180),
  }),
  // 스텝 패턴: 어떤 타입의 스텝이 몇 개씩 필요한지 정의
  stepPattern: z
    .array(
      z.object({
        stepType: SessionStepTypeSchema,
        minCount: z.number().int().min(0).max(10).default(1),
        maxCount: z.number().int().min(1).max(10).default(1),
        isOptional: z.boolean().default(false),
      }),
    )
    .min(1),
});
export type SessionTemplate = z.infer<typeof SessionTemplateSchema>;

export const SessionRunStatusSchema = z.enum([
  "LOADING",
  "ACTIVE",
  "COMPLETING",
  "COMPLETED",
]);
export type SessionRunStatus = z.infer<typeof SessionRunStatusSchema>;

export const SessionRunSchema = z.object({
  runId: UuidSchema,
  planId: UuidSchema,
  sessionId: UuidSchema,
  blueprintId: UuidSchema,
  isRecovery: z.boolean().default(false),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  currentStepId: SessionStepIdSchema,
  stepHistory: z.array(SessionStepIdSchema).min(1),
  historyIndex: z.number().int().min(0),
  inputs: z.record(z.string(), JsonValueSchema).default({}),
  createdConceptIds: z.array(UuidSchema).max(10).default([]),
  status: SessionRunStatusSchema,
});
export type SessionRun = z.infer<typeof SessionRunSchema>;

export const DbSchema = z.object({
  version: z.number().int().nonnegative(),
  user: UserSchema.optional(),
  spaces: z.array(SpaceSchema),
  documents: z.array(DocumentSchema),
  plans: z.array(PlanSchema),
  concepts: z.array(ConceptSchema),
  sessionBlueprints: z.array(SessionBlueprintSchema),
  sessionRuns: z.array(SessionRunSchema),
});
export type Db = z.infer<typeof DbSchema>;
