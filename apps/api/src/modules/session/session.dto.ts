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

export const HomeQueueItem = z.object({
  sessionId: PublicIdSchema,
  spaceName: z.string().min(1),
  planTitle: z.string().min(1),
  moduleTitle: z.string().min(1),
  sessionTitle: z.string().min(1),
  sessionType: PlanSessionTypeSchema,
  estimatedMinutes: z.number().int().min(1),
  status: PlanSessionStatusSchema,
});
export type HomeQueueItem = z.infer<typeof HomeQueueItem>;

export const HomeQueueResponse = z.object({
  data: z.array(HomeQueueItem),
  summary: z.object({
    total: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
  }),
});
export type HomeQueueResponse = z.infer<typeof HomeQueueResponse>;

export const SessionRunStatusSchema = z.enum([
  "RUNNING",
  "COMPLETED",
  "ABANDONED",
]);
export type SessionRunStatus = z.infer<typeof SessionRunStatusSchema>;

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
    conceptsCreated: z.number().int().nonnegative(),
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
