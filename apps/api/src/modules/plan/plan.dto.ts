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

export const PlanGoalTypeSchema = z.enum([
  "JOB",
  "CERT",
  "WORK",
  "HOBBY",
  "OTHER",
]);
export type PlanGoalType = z.infer<typeof PlanGoalTypeSchema>;

export const PlanLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export type PlanLevel = z.infer<typeof PlanLevelSchema>;

export const CreatePlanInput = z.object({
  materialIds: z.array(z.string().uuid()).min(1).max(5),
  goalType: PlanGoalTypeSchema,
  currentLevel: PlanLevelSchema,
  targetDueDate: z.string().date(),
  specialRequirements: z.string().max(2000).optional(),
});
export type CreatePlanInput = z.infer<typeof CreatePlanInput>;

export const ListPlansInput = PaginationInput.extend({
  spaceId: PublicIdSchema,
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
  status: PlanStatusSchema,
  goalType: PlanGoalTypeSchema,
  progress: PlanProgress,
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
    status: PlanStatusSchema,
  }),
});
export type CreatePlanResponse = z.infer<typeof CreatePlanResponse>;

// Session 관련 Enum 스키마
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
    spaceId: PublicIdSchema,
    title: z.string().min(1),
    status: PlanStatusSchema,
    goalType: PlanGoalTypeSchema,
    currentLevel: PlanLevelSchema,
    targetDueDate: z.string().date(),
    specialRequirements: z.string().nullable(),
    progress: PlanProgress,
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
