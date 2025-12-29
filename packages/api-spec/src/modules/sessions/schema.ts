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

export const HomeQueueItemSchema = z.object({
  sessionId: PublicIdSchema,
  spaceName: z.string().min(1),
  planTitle: z.string().min(1),
  moduleTitle: z.string().min(1),
  sessionTitle: z.string().min(1),
  sessionType: PlanSessionTypeSchema,
  estimatedMinutes: z.number().int().min(1),
  status: PlanSessionStatusSchema,
});

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
  reason: z.enum(["USER_EXIT", "NETWORK", "ERROR", "TIMEOUT"]),
});

export const AbandonSessionRunResponseSchema = z.object({
  data: z.object({
    runId: PublicIdSchema,
    status: SessionRunStatusSchema,
  }),
});
