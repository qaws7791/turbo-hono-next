import { z } from "zod";

import { isPublicId } from "../../lib/public-id";

const PublicIdSchema = z.string().refine(isPublicId, "Invalid public id");

export const PlanSessionTypeSchema = z.enum(["LEARN", "REVIEW"]);
export type PlanSessionType = z.infer<typeof PlanSessionTypeSchema>;

export const PlanSessionStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELED",
]);
export type PlanSessionStatus = z.infer<typeof PlanSessionStatusSchema>;

export const HomeQueueSessionItem = z.object({
  kind: z.literal("SESSION"),
  sessionId: PublicIdSchema,
  planId: PublicIdSchema,
  planTitle: z.string().min(1),
  planIcon: z.string().min(1).max(50),
  planColor: z.string().min(1).max(50),
  moduleTitle: z.string().min(1),
  sessionTitle: z.string().min(1),
  sessionType: PlanSessionTypeSchema,
  estimatedMinutes: z.number().int().min(1),
  status: PlanSessionStatusSchema,
});
export type HomeQueueSessionItem = z.infer<typeof HomeQueueSessionItem>;

export const HomeQueueItem = HomeQueueSessionItem;
export type HomeQueueItem = z.infer<typeof HomeQueueItem>;

export const HomeQueueResponse = z.object({
  data: z.array(HomeQueueItem),
  summary: z.object({
    total: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    estimatedMinutes: z.number().int().nonnegative(),
    coachingMessage: z.string().min(1),
    streakDays: z.number().int().nonnegative(),
  }),
});
export type HomeQueueResponse = z.infer<typeof HomeQueueResponse>;

export const SessionRunStatusSchema = z.enum([
  "RUNNING",
  "COMPLETED",
  "ABANDONED",
]);
export type SessionRunStatus = z.infer<typeof SessionRunStatusSchema>;

// ============================================================
// Session Blueprint (Steps)
// ============================================================

export const SessionStepTypeSchema = z.enum([
  "SESSION_INTRO",
  "CHECK",
  "CLOZE",
  "MATCHING",
  "FLASHCARD",
  "SPEED_OX",
  "APPLICATION",
  "SESSION_SUMMARY",
]);
export type SessionStepType = z.infer<typeof SessionStepTypeSchema>;

export const SessionStepIdSchema = z.string().min(1).max(80);
export type SessionStepId = z.infer<typeof SessionStepIdSchema>;

export const SessionDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;

export const SessionStepIntentSchema = z.enum([
  "INTRO",
  "EXPLAIN",
  "RETRIEVAL",
  "PRACTICE",
  "WRAPUP",
]);
export type SessionStepIntent = z.infer<typeof SessionStepIntentSchema>;

const SessionStepBaseSchema = z.object({
  id: SessionStepIdSchema,
  estimatedSeconds: z
    .number()
    .int()
    .positive()
    .max(60 * 60)
    .optional(),
  intent: SessionStepIntentSchema.optional(),
});

export const SessionStepSchema = z.discriminatedUnion("type", [
  SessionStepBaseSchema.extend({
    type: z.literal("SESSION_INTRO"),
    planTitle: z.string().min(1).max(120),
    moduleTitle: z.string().min(1).max(120),
    sessionTitle: z.string().min(1).max(120),
    durationMinutes: z.number().int().min(1).max(180),
    difficulty: SessionDifficultySchema,
    learningGoals: z.array(z.string().min(1).max(200)).min(1).max(5),
    questionsToCover: z.array(z.string().min(1).max(200)).min(1).max(5),
    prerequisites: z.array(z.string().min(1).max(100)).max(5).default([]),
  }),

  SessionStepBaseSchema.extend({
    type: z.literal("CHECK"),
    question: z.string().min(1).max(500),
    options: z.array(z.string().min(1).max(200)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    explanation: z.string().max(500).optional(),
  }),

  SessionStepBaseSchema.extend({
    type: z.literal("CLOZE"),
    sentence: z.string().min(1).max(500),
    blankId: z.string().min(1).max(50),
    options: z.array(z.string().min(1).max(100)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    explanation: z.string().max(500).optional(),
  }),

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

  SessionStepBaseSchema.extend({
    type: z.literal("FLASHCARD"),
    front: z.string().min(1).max(500),
    back: z.string().min(1).max(1_000),
  }),

  SessionStepBaseSchema.extend({
    type: z.literal("SPEED_OX"),
    statement: z.string().min(1).max(300),
    isTrue: z.boolean(),
    explanation: z.string().max(500).optional(),
  }),

  SessionStepBaseSchema.extend({
    type: z.literal("APPLICATION"),
    scenario: z.string().min(1).max(1_000),
    question: z.string().min(1).max(500),
    options: z.array(z.string().min(1).max(300)).min(2).max(4),
    correctIndex: z.number().int().min(0).max(3),
    feedback: z.string().max(500).optional(),
  }),

  SessionStepBaseSchema.extend({
    type: z.literal("SESSION_SUMMARY"),
    celebrationEmoji: z.string().min(1).max(10).default("🎉"),
    encouragement: z.string().min(1).max(200),
    studyTimeMinutes: z.number().int().min(0).optional(),
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

export const SessionBlueprint = z.object({
  schemaVersion: z.number().int().positive(),
  blueprintId: z.string().uuid(),
  createdAt: z.string().datetime(),
  steps: z.array(SessionStepSchema).min(1),
  startStepIndex: z.number().int().nonnegative().default(0),
});
export type SessionBlueprint = z.infer<typeof SessionBlueprint>;

export const CreateSessionRunResponse = z.object({
  data: z.object({
    runId: PublicIdSchema,
    sessionId: PublicIdSchema,
    status: SessionRunStatusSchema,
    isRecovery: z.boolean(),
    currentStep: z.number().int().nonnegative(),
  }),
});
export type CreateSessionRunResponse = z.infer<typeof CreateSessionRunResponse>;

export type CreateSessionRunResult =
  | { statusCode: 200; data: CreateSessionRunResponse["data"] }
  | { statusCode: 201; data: CreateSessionRunResponse["data"] };

export const UpdateSessionRunProgressInput = z.object({
  stepIndex: z.number().int().nonnegative(),
  inputs: z.record(z.string(), z.unknown()),
});
export type UpdateSessionRunProgressInput = z.infer<
  typeof UpdateSessionRunProgressInput
>;

export const UpdateSessionRunProgressResponse = z.object({
  data: z.object({
    runId: PublicIdSchema,
    savedAt: z.string().datetime(),
  }),
});
export type UpdateSessionRunProgressResponse = z.infer<
  typeof UpdateSessionRunProgressResponse
>;

export const CompleteSessionRunResponse = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
    summary: z.object({ id: z.string().uuid() }).nullable(),
  }),
});
export type CompleteSessionRunResponse = z.infer<
  typeof CompleteSessionRunResponse
>;

export const SessionExitReasonSchema = z.enum([
  "USER_EXIT",
  "NETWORK",
  "ERROR",
  "TIMEOUT",
]);
export type SessionExitReason = z.infer<typeof SessionExitReasonSchema>;

export const AbandonSessionRunResponse = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
  }),
});
export type AbandonSessionRunResponse = z.infer<
  typeof AbandonSessionRunResponse
>;

export const UpdatePlanSessionInput = z.object({
  status: PlanSessionStatusSchema.optional(),
  scheduledForDate: z.string().date().optional(),
});
export type UpdatePlanSessionInput = z.infer<typeof UpdatePlanSessionInput>;

export const UpdatePlanSessionResponse = z.object({
  data: z.object({
    sessionId: PublicIdSchema,
    status: PlanSessionStatusSchema,
    scheduledForDate: z.string().date(),
  }),
});
export type UpdatePlanSessionResponse = z.infer<
  typeof UpdatePlanSessionResponse
>;

export const SessionCheckinKindSchema = z.enum([
  "QUESTION",
  "SELF_ASSESSMENT",
  "BEHAVIOR_SIGNAL",
]);
export type SessionCheckinKind = z.infer<typeof SessionCheckinKindSchema>;

export const SessionActivityKindSchema = z.enum([
  "EXERCISE",
  "MCQ",
  "FREEFORM",
  "CODE",
]);
export type SessionActivityKind = z.infer<typeof SessionActivityKindSchema>;

export const CreateSessionCheckinInput = z.object({
  kind: SessionCheckinKindSchema,
  prompt: z.string().min(1),
  responseJson: z.record(z.string(), z.unknown()).optional(),
});
export type CreateSessionCheckinInput = z.infer<
  typeof CreateSessionCheckinInput
>;

export const CreateSessionCheckinResponse = z.object({
  data: z.object({
    id: z.string().uuid(),
    recordedAt: z.string().datetime(),
  }),
});
export type CreateSessionCheckinResponse = z.infer<
  typeof CreateSessionCheckinResponse
>;

export const CreateSessionActivityInput = z.object({
  kind: SessionActivityKindSchema,
  prompt: z.string().min(1),
  userAnswer: z.string().optional(),
  aiEvalJson: z.record(z.string(), z.unknown()).optional(),
});
export type CreateSessionActivityInput = z.infer<
  typeof CreateSessionActivityInput
>;

export const CreateSessionActivityResponse = z.object({
  data: z.object({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
  }),
});
export type CreateSessionActivityResponse = z.infer<
  typeof CreateSessionActivityResponse
>;

export const SessionCheckin = z.object({
  id: z.string().uuid(),
  kind: SessionCheckinKindSchema,
  prompt: z.string().min(1),
  responseJson: z.record(z.string(), z.unknown()).nullable(),
  recordedAt: z.string().datetime(),
});
export type SessionCheckin = z.infer<typeof SessionCheckin>;

export const SessionActivity = z.object({
  id: z.string().uuid(),
  kind: SessionActivityKindSchema,
  prompt: z.string().min(1),
  userAnswer: z.string().nullable(),
  aiEvalJson: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});
export type SessionActivity = z.infer<typeof SessionActivity>;

export const ListSessionCheckinsResponse = z.object({
  data: z.array(SessionCheckin),
});
export type ListSessionCheckinsResponse = z.infer<
  typeof ListSessionCheckinsResponse
>;

export const ListSessionActivitiesResponse = z.object({
  data: z.array(SessionActivity),
});
export type ListSessionActivitiesResponse = z.infer<
  typeof ListSessionActivitiesResponse
>;

export const SessionRunDetailResponse = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime().nullable(),
    exitReason: SessionExitReasonSchema.nullable(),
    session: z.object({
      sessionId: PublicIdSchema,
      title: z.string().min(1),
      objective: z.string().nullable(),
      sessionType: PlanSessionTypeSchema,
      estimatedMinutes: z.number().int().min(1),
      module: z
        .object({
          id: z.string().uuid(),
          title: z.string().min(1),
        })
        .nullable(),
      plan: z.object({
        id: PublicIdSchema,
        title: z.string().min(1),
        icon: z.string().min(1).max(50),
        color: z.string().min(1).max(50),
      }),
    }),
    blueprint: SessionBlueprint,
    progress: z.object({
      stepIndex: z.number().int().nonnegative(),
      inputs: z.record(z.string(), z.unknown()),
      savedAt: z.string().datetime().nullable(),
    }),
    summary: z
      .object({
        id: z.string().uuid(),
        summaryMd: z.string().min(1),
        reviewsScheduledCount: z.number().int().nonnegative(),
        createdAt: z.string().datetime(),
      })
      .nullable(),
  }),
});
export type SessionRunDetailResponse = z.infer<typeof SessionRunDetailResponse>;

export const ListSessionRunsInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: SessionRunStatusSchema.optional(),
});
export type ListSessionRunsInput = z.infer<typeof ListSessionRunsInput>;

export const SessionRunListItem = z.object({
  runId: PublicIdSchema,
  status: SessionRunStatusSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  exitReason: SessionExitReasonSchema.nullable(),
  durationMinutes: z.number().int().nonnegative(),
  sessionId: PublicIdSchema,
  sessionTitle: z.string().min(1),
  sessionType: PlanSessionTypeSchema,
  planId: PublicIdSchema,
  planTitle: z.string().min(1),
  planIcon: z.string().min(1).max(50),
  planColor: z.string().min(1).max(50),
  summary: z
    .object({
      id: z.string().uuid(),
      reviewsScheduledCount: z.number().int().nonnegative(),
      createdAt: z.string().datetime(),
    })
    .nullable(),
});
export type SessionRunListItem = z.infer<typeof SessionRunListItem>;

export const ListSessionRunsResponse = z.object({
  data: z.array(SessionRunListItem),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
  }),
});
export type ListSessionRunsResponse = z.infer<typeof ListSessionRunsResponse>;
