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

const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
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
// 기존 타입 + 확장 타입으로 유동적인 세션 구성 지원

export const SessionStepTypeSchema = z.enum([
  // 기존 타입
  "LEARN",
  "CHECK",
  "PRACTICE",
  "COMPLETE",
  // 확장 타입
  "INFO",
  "CODE",
  "FLASHCARD",
  "FILL_BLANK",
  "SUMMARY",
]);
export type SessionStepType = z.infer<typeof SessionStepTypeSchema>;

export const SessionStepSchema = z.discriminatedUnion("type", [
  // === 기존 타입 (하위 호환성 유지) ===
  z.object({
    type: z.literal("LEARN"),
    title: z.string().min(1).max(120),
    content: z.string().min(1).max(5_000),
  }),
  z.object({
    type: z.literal("CHECK"),
    question: z.string().min(1).max(500),
    options: z.array(z.string().min(1).max(200)).min(2).max(6),
    answerIndex: z.number().int().min(0).max(5),
    explanation: z.string().max(500).optional(), // 정답 설명 (신규 추가)
  }),
  z.object({
    type: z.literal("PRACTICE"),
    prompt: z.string().min(1).max(1_000),
    placeholder: z.string().min(1).max(120).optional(),
  }),
  z.object({
    type: z.literal("COMPLETE"),
    summary: z.string().min(1).max(1_000),
    createdConceptIds: z.array(UuidSchema).max(10).default([]),
  }),

  // === 확장 타입 (새로운 학습 활동) ===

  // 읽기 전용 정보 카드 (팁, 경고, 예제 등)
  z.object({
    type: z.literal("INFO"),
    title: z.string().min(1).max(120),
    content: z.string().min(1).max(3_000),
    variant: z.enum(["info", "warning", "tip", "example"]).default("info"),
  }),

  // 코드 실습 (코드 입력 + 검증)
  z.object({
    type: z.literal("CODE"),
    instruction: z.string().min(1).max(500),
    starterCode: z.string().max(2_000).optional(),
    language: z
      .enum(["javascript", "typescript", "python", "css", "html", "other"])
      .default("javascript"),
    hint: z.string().max(300).optional(),
  }),

  // 플래시카드 (앞면/뒷면 회상)
  z.object({
    type: z.literal("FLASHCARD"),
    front: z.string().min(1).max(500),
    back: z.string().min(1).max(1_000),
  }),

  // 빈칸 채우기
  z.object({
    type: z.literal("FILL_BLANK"),
    instruction: z.string().min(1).max(300),
    template: z.string().min(1).max(1_000), // {{blank_id}} 형식으로 빈칸 표시
    blanks: z
      .array(
        z.object({
          id: z.string().min(1).max(50),
          answer: z.string().min(1).max(100),
          alternatives: z.array(z.string().min(1).max(100)).optional(), // 허용되는 대안 답안
        }),
      )
      .min(1)
      .max(10),
  }),

  // 중간 요약 (학습 내용 정리)
  z.object({
    type: z.literal("SUMMARY"),
    title: z.string().min(1).max(120),
    points: z.array(z.string().min(1).max(300)).min(1).max(10),
    nextHint: z.string().max(200).optional(), // 다음 스텝 힌트
  }),
]);
export type SessionStep = z.infer<typeof SessionStepSchema>;

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
  isRecovery: z.boolean().default(false),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  currentStep: z.number().int().min(0),
  totalSteps: z.number().int().min(1),
  steps: z.array(SessionStepSchema).min(1),
  inputs: z.record(z.string(), JsonValueSchema).default({}),
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
  sessionRuns: z.array(SessionRunSchema),
});
export type Db = z.infer<typeof DbSchema>;
