import { z } from "zod";

import { PaginationInput } from "../../lib/pagination";
import { isPublicId } from "../../lib/public-id";

const PublicIdSchema = z.string().refine(isPublicId, "Invalid public id");

export const PlanStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
  "COMPLETED",
]);
export type PlanStatus = z.infer<typeof PlanStatusSchema>;

export const PlanGenerationStatusSchema = z.enum([
  "PENDING",
  "GENERATING",
  "READY",
  "FAILED",
]);
export type PlanGenerationStatus = z.infer<typeof PlanGenerationStatusSchema>;

export const CreatePlanInput = z.object({
  materialIds: z.array(z.string().uuid()).min(1).max(5),
  targetDueDate: z.string().date().nullable(),
  specialRequirements: z.string().max(2000).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
});
export type CreatePlanInput = z.infer<typeof CreatePlanInput>;

export const UpdatePlanInput = z
  .object({
    title: z.string().min(1).max(200).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    status: PlanStatusSchema.optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.icon !== undefined ||
      value.color !== undefined ||
      value.status !== undefined,
    "수정할 필드가 필요합니다.",
  );
export type UpdatePlanInput = z.infer<typeof UpdatePlanInput>;

export const ListPlansInput = PaginationInput.extend({
  status: PlanStatusSchema.optional(),
});
export type ListPlansInput = z.infer<typeof ListPlansInput>;

export const PlanProgress = z.object({
  completedSessions: z.number().int().nonnegative(),
  totalSessions: z.number().int().nonnegative(),
});
export type PlanProgress = z.infer<typeof PlanProgress>;

export const PlanListItem = z.object({
  id: PublicIdSchema,
  title: z.string().min(1),
  icon: z.string(),
  color: z.string(),
  status: PlanStatusSchema,
  generationStatus: PlanGenerationStatusSchema,
  jobId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  progress: PlanProgress,
  sourceMaterialIds: z.array(z.string().uuid()),
});
export type PlanListItem = z.infer<typeof PlanListItem>;

export const PlanListMeta = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});
export type PlanListMeta = z.infer<typeof PlanListMeta>;

export const ListPlansResponse = z.object({
  data: z.array(PlanListItem),
  meta: PlanListMeta,
});
export type ListPlansResponse = z.infer<typeof ListPlansResponse>;

export const CreatePlanResponse = z.object({
  data: z.object({
    id: PublicIdSchema,
    title: z.string().min(1),
    icon: z.string(),
    color: z.string(),
    status: PlanStatusSchema,
    generationStatus: PlanGenerationStatusSchema,
    jobId: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});
export type CreatePlanResponse = z.infer<typeof CreatePlanResponse>;

export const UpdatePlanResponse = z.object({
  data: z.object({
    id: PublicIdSchema,
    title: z.string(),
    icon: z.string(),
    color: z.string(),
    status: PlanStatusSchema,
  }),
});
export type UpdatePlanResponse = z.infer<typeof UpdatePlanResponse>;

// Session 관련 Enum 스키마
export const PlanSessionTypeSchema = z.enum(["LEARN"]);
export type PlanSessionType = z.infer<typeof PlanSessionTypeSchema>;

export const PlanSessionStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELED",
]);
export type PlanSessionStatus = z.infer<typeof PlanSessionStatusSchema>;

// Plan Module 아이템 스키마
export const PlanModuleItem = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  orderIndex: z.number().int().nonnegative(),
});
export type PlanModuleItem = z.infer<typeof PlanModuleItem>;

// Plan Session 아이템 스키마
export const PlanSessionItem = z.object({
  id: PublicIdSchema,
  moduleId: z.string().uuid().nullable(),
  sessionType: PlanSessionTypeSchema,
  title: z.string().min(1),
  objective: z.string().nullable(),
  orderIndex: z.number().int().nonnegative(),
  scheduledForDate: z.string().date(),
  estimatedMinutes: z.number().int().min(1),
  status: PlanSessionStatusSchema,
  completedAt: z.string().datetime().nullable(),
});
export type PlanSessionItem = z.infer<typeof PlanSessionItem>;

export const PlanDetailResponse = z.object({
  data: z.object({
    id: PublicIdSchema,
    title: z.string().min(1),
    icon: z.string(),
    color: z.string(),
    status: PlanStatusSchema,
    generationStatus: PlanGenerationStatusSchema,
    jobId: z.string().optional(),
    generationError: z.string().nullable().optional(),
    targetDueDate: z.string().date().nullable(),
    specialRequirements: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    progress: PlanProgress,
    sourceMaterialIds: z.array(z.string().uuid()),
    materials: z.array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        summary: z.string().nullable(),
        mimeType: z.string().nullable(),
      }),
    ),
    modules: z.array(PlanModuleItem),
    sessions: z.array(PlanSessionItem),
  }),
});
export type PlanDetailResponse = z.infer<typeof PlanDetailResponse>;

export const ActivatePlanResponse = z.object({
  data: z.object({
    id: PublicIdSchema,
    status: PlanStatusSchema,
  }),
});
export type ActivatePlanResponse = z.infer<typeof ActivatePlanResponse>;

export const UpdatePlanStatusResponse = z.object({
  data: z.object({
    id: PublicIdSchema,
    status: PlanStatusSchema,
  }),
});
export type UpdatePlanStatusResponse = z.infer<typeof UpdatePlanStatusResponse>;

export const DeletePlanResponse = z.object({
  message: z.string().min(1),
});
export type DeletePlanResponse = z.infer<typeof DeletePlanResponse>;
