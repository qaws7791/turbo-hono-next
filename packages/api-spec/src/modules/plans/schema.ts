import { z } from "@hono/zod-openapi";

import { PublicIdSchema } from "../../common/schema";
import {
  PlanSessionStatusSchema,
  PlanSessionTypeSchema,
} from "../sessions/schema";

export const PlanStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
  "COMPLETED",
]);

export const PlanProgressSchema = z.object({
  completedSessions: z.number().int().nonnegative(),
  totalSessions: z.number().int().nonnegative(),
});

export const PlanListItemSchema = z.object({
  id: PublicIdSchema,
  title: z.string().min(1),
  icon: z.string(),
  color: z.string(),
  status: PlanStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  progress: PlanProgressSchema,
  sourceMaterialIds: z.array(z.uuid()),
});

export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export const PlanListResponseSchema = z.object({
  data: z.array(PlanListItemSchema),
  meta: PaginationMetaSchema,
});

export const CreatePlanRequestSchema = z.object({
  materialIds: z.array(z.uuid()).min(1).max(5),
  targetDueDate: z.iso.date().nullable(),
  specialRequirements: z.string().max(2000).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
});

export const CreatePlanResponseSchema = z.object({
  data: z.object({
    id: PublicIdSchema,
    title: z.string().min(1),
    icon: z.string(),
    color: z.string(),
    status: PlanStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
});

// Plan Module 아이템 스키마
export const PlanModuleItemSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  orderIndex: z.number().int().nonnegative(),
});

// Plan Session 아이템 스키마
export const PlanSessionItemSchema = z.object({
  id: PublicIdSchema,
  moduleId: z.uuid().nullable(),
  sessionType: PlanSessionTypeSchema,
  title: z.string().min(1),
  objective: z.string().nullable(),
  orderIndex: z.number().int().nonnegative(),
  scheduledForDate: z.iso.date(),
  estimatedMinutes: z.number().int().min(1),
  status: PlanSessionStatusSchema,
  completedAt: z.iso.datetime().nullable(),
});

export const PlanDetailResponseSchema = z.object({
  data: z.object({
    id: PublicIdSchema,
    title: z.string().min(1),
    icon: z.string(),
    color: z.string(),
    status: PlanStatusSchema,
    targetDueDate: z.iso.date().nullable(),
    specialRequirements: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    progress: PlanProgressSchema,
    sourceMaterialIds: z.array(z.uuid()),
    materials: z.array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        summary: z.string().nullable(),
        mimeType: z.string().nullable(),
      }),
    ),
    modules: z.array(PlanModuleItemSchema),
    sessions: z.array(PlanSessionItemSchema),
  }),
});

export const UpdatePlanRequestSchema = z
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

export const UpdatePlanResponseSchema = z.object({
  data: z.object({
    id: PublicIdSchema,
    title: z.string(),
    icon: z.string(),
    color: z.string(),
    status: PlanStatusSchema,
  }),
});

export const UpdatePlanStatusRequestSchema = z.object({
  status: PlanStatusSchema,
});

export const UpdatePlanStatusResponseSchema = z.object({
  data: z.object({
    id: PublicIdSchema,
    status: PlanStatusSchema,
  }),
});

export const ActivatePlanResponseSchema = z.object({
  data: z.object({
    id: PublicIdSchema,
    status: PlanStatusSchema,
  }),
});

export const DeletePlanResponseSchema = z.object({
  message: z.string().min(1),
});
