import { createRoute, z } from "@hono/zod-openapi";

import { ErrorResponseSchema, PublicIdSchema } from "../../common/schema";

import {
  ActivatePlanResponseSchema,
  CreatePlanRequestSchema,
  CreatePlanResponseSchema,
  DeletePlanResponseSchema,
  PlanDetailResponseSchema,
  PlanListResponseSchema,
  PlanStatusSchema,
  UpdatePlanRequestSchema,
  UpdatePlanResponseSchema,
  UpdatePlanStatusRequestSchema,
  UpdatePlanStatusResponseSchema,
} from "./schema";

export const listPlansRoute = createRoute({
  tags: ["plans"],
  method: "get",
  path: "/api/plans",
  summary: "Plan 목록 조회",
  description:
    "사용자의 학습 계획 목록을 조회합니다.\n\n**필터링**: `status`별 조회 가능",
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      status: PlanStatusSchema.optional(),
    }),
  },
  responses: {
    200: {
      description: "Plan 목록을 반환합니다.",
      content: { "application/json": { schema: PlanListResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const getPlanDetailRoute = createRoute({
  tags: ["plans"],
  method: "get",
  path: "/api/plans/{planId}",
  summary: "Plan 상세 조회",
  description:
    "학습 계획의 상세 정보를 조회합니다. 세션 목록과 진행률을 포함합니다.",
  request: {
    params: z.object({ planId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Plan 상세를 반환합니다.",
      content: { "application/json": { schema: PlanDetailResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createPlanRoute = createRoute({
  tags: ["plans"],
  method: "post",
  path: "/api/plans",
  summary: "Plan 생성",
  description:
    "AI가 자료를 분석하여 학습 계획을 생성합니다. 세션이 자동 생성됩니다.",
  request: {
    body: {
      content: { "application/json": { schema: CreatePlanRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Plan이 생성되었습니다.",
      content: { "application/json": { schema: CreatePlanResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const updatePlanRoute = createRoute({
  tags: ["plans"],
  method: "patch",
  path: "/api/plans/{planId}",
  summary: "Plan 수정",
  description: "학습 계획의 제목, 아이콘, 색상 등을 수정합니다.",
  request: {
    params: z.object({ planId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: UpdatePlanRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Plan이 수정되었습니다.",
      content: {
        "application/json": { schema: UpdatePlanResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const updatePlanStatusRoute = createRoute({
  tags: ["plans"],
  method: "patch",
  path: "/api/plans/{planId}/status",
  summary: "Plan 상태 변경",
  description:
    "학습 계획의 상태를 변경합니다.\n\n**상태**: `draft`, `active`, `paused`, `completed`",
  request: {
    params: z.object({ planId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: UpdatePlanStatusRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Plan 상태가 변경되었습니다.",
      content: {
        "application/json": { schema: UpdatePlanStatusResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const activatePlanRoute = createRoute({
  tags: ["plans"],
  method: "post",
  path: "/api/plans/{planId}/activate",
  summary: "Plan Active 설정",
  description:
    "학습 계획을 활성화합니다. 기존 활성 계획은 자동으로 비활성화됩니다.",
  request: {
    params: z.object({ planId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Plan이 ACTIVE로 설정되었습니다.",
      content: { "application/json": { schema: ActivatePlanResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const deletePlanRoute = createRoute({
  tags: ["plans"],
  method: "delete",
  path: "/api/plans/{planId}",
  summary: "Plan 삭제",
  description: "학습 계획을 삭제합니다. 세션 기록도 함께 삭제됩니다.",
  request: {
    params: z.object({ planId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Plan이 삭제되었습니다.",
      content: { "application/json": { schema: DeletePlanResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const planRoutes = [
  listPlansRoute,
  getPlanDetailRoute,
  createPlanRoute,
  updatePlanRoute,
  updatePlanStatusRoute,
  activatePlanRoute,
  deletePlanRoute,
] as const;
