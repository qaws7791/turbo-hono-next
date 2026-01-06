import { z } from "@hono/zod-openapi";

import { PublicIdSchema } from "../../common/schema";

export const PlanSessionTypeSchema = z.enum(["LEARN", "REVIEW"]);
export const PlanSessionStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELED",
]);

export const SessionExitReasonSchema = z.enum([
  "USER_EXIT",
  "NETWORK",
  "ERROR",
  "TIMEOUT",
]);

export const ConceptReviewStatusSchema = z.enum(["GOOD", "DUE", "OVERDUE"]);

export const HomeQueueSessionItemSchema = z.object({
  kind: z.literal("SESSION"),
  sessionId: PublicIdSchema,
  spaceId: PublicIdSchema,
  spaceName: z.string().min(1),
  spaceIcon: z.string().min(1).max(50),
  spaceColor: z.string().min(1).max(50),
  planTitle: z.string().min(1),
  moduleTitle: z.string().min(1),
  sessionTitle: z.string().min(1),
  sessionType: PlanSessionTypeSchema,
  estimatedMinutes: z.number().int().min(1),
  status: PlanSessionStatusSchema,
});

export const HomeQueueConceptReviewItemSchema = z.object({
  kind: z.literal("CONCEPT_REVIEW"),
  conceptId: PublicIdSchema,
  conceptTitle: z.string().min(1),
  oneLiner: z.string().min(1),
  spaceId: PublicIdSchema,
  spaceName: z.string().min(1),
  spaceIcon: z.string().min(1).max(50),
  spaceColor: z.string().min(1).max(50),
  sessionType: z.literal("REVIEW"),
  estimatedMinutes: z.number().int().min(1),
  reviewStatus: ConceptReviewStatusSchema,
  dueAt: z.iso.datetime().nullable(),
});

export const HomeQueueItemSchema = z.discriminatedUnion("kind", [
  HomeQueueSessionItemSchema,
  HomeQueueConceptReviewItemSchema,
]);

export const HomeQueueResponseSchema = z.object({
  data: z.array(HomeQueueItemSchema),
  summary: z.object({
    total: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
  }),
});

export const SessionRunStatusSchema = z.enum([
  "RUNNING",
  "COMPLETED",
  "ABANDONED",
]);

export const SessionCheckinKindSchema = z.enum([
  "QUESTION",
  "SELF_ASSESSMENT",
  "BEHAVIOR_SIGNAL",
]);

export const SessionActivityKindSchema = z.enum([
  "EXERCISE",
  "MCQ",
  "FREEFORM",
  "CODE",
]);

// ============================================================
// Session Blueprint (Steps)
// ============================================================

export const SessionStepTypeSchema = z.enum([
  "SESSION_INTRO",
  "CONCEPT",
  "CHECK",
  "CLOZE",
  "MATCHING",
  "FLASHCARD",
  "SPEED_OX",
  "APPLICATION",
  "SESSION_SUMMARY",
]);

export const SessionStepIdSchema = z.string().min(1).max(80);

export const SessionDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const SessionStepIntentSchema = z.enum([
  "INTRO",
  "EXPLAIN",
  "RETRIEVAL",
  "PRACTICE",
  "WRAPUP",
]);

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
    type: z.literal("CONCEPT"),
    title: z.string().min(1).max(120),
    content: z.string().min(1).max(10_000),
    chapterIndex: z.number().int().min(1).optional(),
    totalChapters: z.number().int().min(1).optional(),
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
    savedConceptCount: z.number().int().min(0).optional(),
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

export const SessionBlueprintSchema = z.object({
  schemaVersion: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  steps: z.array(SessionStepSchema).min(1),
  startStepIndex: z.number().int().nonnegative().default(0),
});

export const CreateSessionRunResponseSchema = z.object({
  data: z.object({
    runId: PublicIdSchema,
    sessionId: PublicIdSchema,
    status: SessionRunStatusSchema,
    isRecovery: z.boolean(),
    currentStep: z.number().int().nonnegative(),
  }),
});

export const UpdateSessionRunProgressRequestSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  inputs: z.record(z.string(), z.unknown()),
});

export const UpdateSessionRunProgressResponseSchema = z.object({
  data: z.object({
    runId: PublicIdSchema,
    savedAt: z.iso.datetime(),
  }),
});

export const CompleteSessionRunResponseSchema = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
    conceptsCreated: z.number().int().nonnegative(),
    summary: z.object({ id: z.uuid() }).nullable(),
  }),
});

export const AbandonSessionRunRequestSchema = z.object({
  reason: SessionExitReasonSchema,
});

export const AbandonSessionRunResponseSchema = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
  }),
});

export const UpdatePlanSessionRequestSchema = z.object({
  status: PlanSessionStatusSchema.optional(),
  scheduledForDate: z.iso.date().optional(),
});

export const UpdatePlanSessionResponseSchema = z.object({
  data: z.object({
    sessionId: PublicIdSchema,
    status: PlanSessionStatusSchema,
    scheduledForDate: z.iso.date(),
  }),
});

export const SessionRunDetailResponseSchema = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
    startedAt: z.iso.datetime(),
    endedAt: z.iso.datetime().nullable(),
    exitReason: SessionExitReasonSchema.nullable(),
    session: z.object({
      sessionId: PublicIdSchema,
      title: z.string().min(1),
      objective: z.string().nullable(),
      sessionType: PlanSessionTypeSchema,
      estimatedMinutes: z.number().int().min(1),
      module: z
        .object({
          id: z.uuid(),
          title: z.string().min(1),
        })
        .nullable(),
      plan: z.object({
        id: PublicIdSchema,
        title: z.string().min(1),
      }),
      space: z.object({
        id: PublicIdSchema,
        name: z.string().min(1),
      }),
    }),
    blueprint: SessionBlueprintSchema,
    progress: z.object({
      stepIndex: z.number().int().nonnegative(),
      inputs: z.record(z.string(), z.unknown()),
      savedAt: z.iso.datetime().nullable(),
    }),
    summary: z
      .object({
        id: z.uuid(),
        summaryMd: z.string().min(1),
        conceptsCreatedCount: z.number().int().nonnegative(),
        conceptsUpdatedCount: z.number().int().nonnegative(),
        reviewsScheduledCount: z.number().int().nonnegative(),
        createdAt: z.iso.datetime(),
      })
      .nullable(),
  }),
});

export const SessionRunListMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export const SessionRunListItemSchema = z.object({
  runId: PublicIdSchema,
  status: SessionRunStatusSchema,
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
  exitReason: SessionExitReasonSchema.nullable(),
  sessionId: PublicIdSchema,
  sessionTitle: z.string().min(1),
  sessionType: PlanSessionTypeSchema,
  planId: PublicIdSchema,
  planTitle: z.string().min(1),
  spaceId: PublicIdSchema,
  spaceName: z.string().min(1),
  summary: z
    .object({
      id: z.uuid(),
      conceptsCreatedCount: z.number().int().nonnegative(),
      conceptsUpdatedCount: z.number().int().nonnegative(),
      reviewsScheduledCount: z.number().int().nonnegative(),
      createdAt: z.iso.datetime(),
    })
    .nullable(),
});

export const ListSessionRunsResponseSchema = z.object({
  data: z.array(SessionRunListItemSchema),
  meta: SessionRunListMetaSchema,
});

export const CreateSessionCheckinRequestSchema = z.object({
  kind: SessionCheckinKindSchema,
  prompt: z.string().min(1),
  responseJson: z.record(z.string(), z.unknown()).optional(),
});

export const CreateSessionCheckinResponseSchema = z.object({
  data: z.object({
    id: z.uuid(),
    recordedAt: z.iso.datetime(),
  }),
});

export const CreateSessionActivityRequestSchema = z.object({
  kind: SessionActivityKindSchema,
  prompt: z.string().min(1),
  userAnswer: z.string().optional(),
  aiEvalJson: z.record(z.string(), z.unknown()).optional(),
});

export const CreateSessionActivityResponseSchema = z.object({
  data: z.object({
    id: z.uuid(),
    createdAt: z.iso.datetime(),
  }),
});

export const SessionCheckinSchema = z.object({
  id: z.uuid(),
  kind: SessionCheckinKindSchema,
  prompt: z.string().min(1),
  responseJson: z.record(z.string(), z.unknown()).nullable(),
  recordedAt: z.iso.datetime(),
});

export const SessionActivitySchema = z.object({
  id: z.uuid(),
  kind: SessionActivityKindSchema,
  prompt: z.string().min(1),
  userAnswer: z.string().nullable(),
  aiEvalJson: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.iso.datetime(),
});

export const ListSessionCheckinsResponseSchema = z.object({
  data: z.array(SessionCheckinSchema),
});

export const ListSessionActivitiesResponseSchema = z.object({
  data: z.array(SessionActivitySchema),
});
