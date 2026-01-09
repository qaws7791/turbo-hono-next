import { createRoute, z } from "@hono/zod-openapi";

import { ErrorResponseSchema, PublicIdSchema } from "../../common/schema";

import {
  AbandonSessionRunRequestSchema,
  AbandonSessionRunResponseSchema,
  CompleteSessionRunResponseSchema,
  CreateSessionActivityRequestSchema,
  CreateSessionActivityResponseSchema,
  CreateSessionCheckinRequestSchema,
  CreateSessionCheckinResponseSchema,
  CreateSessionRunResponseSchema,
  HomeQueueResponseSchema,
  ListSessionActivitiesResponseSchema,
  ListSessionCheckinsResponseSchema,
  ListSessionRunsResponseSchema,
  SessionRunDetailResponseSchema,
  SessionRunStatusSchema,
  UpdatePlanSessionRequestSchema,
  UpdatePlanSessionResponseSchema,
  UpdateSessionRunProgressRequestSchema,
  UpdateSessionRunProgressResponseSchema,
} from "./schema";

export const homeQueueRoute = createRoute({
  tags: ["sessions"],
  method: "get",
  path: "/api/home/queue",
  summary: "오늘 할 일 큐 조회",
  description: "오늘 학습해야 할 세션 목록을 조회합니다.",
  responses: {
    200: {
      description: "오늘 예정된 세션을 반환합니다.",
      content: { "application/json": { schema: HomeQueueResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createSessionRunRoute = createRoute({
  tags: ["sessions"],
  method: "post",
  path: "/api/sessions/{sessionId}/runs",
  summary: "Session Run 생성/재개",
  description:
    "학습 세션을 시작하거나 중단된 세션을 재개합니다.\n\n**멱등성**: `Idempotency-Key` 헤더로 중복 요청 방지",
  request: {
    params: z.object({ sessionId: PublicIdSchema }),
    headers: z
      .object({
        "Idempotency-Key": z.uuid().optional(),
      })
      .partial(),
  },
  responses: {
    200: {
      description: "복구된 Run을 반환합니다.",
      content: {
        "application/json": { schema: CreateSessionRunResponseSchema },
      },
    },
    201: {
      description: "새 Run이 생성되었습니다.",
      content: {
        "application/json": { schema: CreateSessionRunResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const updatePlanSessionRoute = createRoute({
  tags: ["sessions"],
  method: "patch",
  path: "/api/sessions/{sessionId}",
  summary: "Plan Session 업데이트",
  description: "세션 상태(SKIPPED/CANCELED 등) 또는 예정 날짜를 변경합니다.",
  request: {
    params: z.object({ sessionId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: UpdatePlanSessionRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "세션이 업데이트되었습니다.",
      content: {
        "application/json": { schema: UpdatePlanSessionResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const getSessionRunDetailRoute = createRoute({
  tags: ["sessions"],
  method: "get",
  path: "/api/session-runs/{runId}",
  summary: "Session Run 상세 조회",
  description: "세션 런과 블루프린트(스텝), 진행 상태를 조회합니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Session Run 상세를 반환합니다.",
      content: {
        "application/json": { schema: SessionRunDetailResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const listSessionRunsRoute = createRoute({
  tags: ["sessions"],
  method: "get",
  path: "/api/session-runs",
  summary: "Session Run 목록 조회",
  description: "최근 실행된 세션 런 목록을 조회합니다.",
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      status: SessionRunStatusSchema.optional(),
    }),
  },
  responses: {
    200: {
      description: "Session Run 목록을 반환합니다.",
      content: {
        "application/json": { schema: ListSessionRunsResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const listSessionCheckinsRoute = createRoute({
  tags: ["sessions"],
  method: "get",
  path: "/api/session-runs/{runId}/checkins",
  summary: "Session Checkins 조회",
  description: "세션 런에 기록된 체크인 로그를 조회합니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "체크인 목록을 반환합니다.",
      content: {
        "application/json": { schema: ListSessionCheckinsResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createSessionCheckinRoute = createRoute({
  tags: ["sessions"],
  method: "post",
  path: "/api/session-runs/{runId}/checkins",
  summary: "Session Checkin 기록",
  description: "세션 런에 체크인을 기록합니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: CreateSessionCheckinRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: "체크인이 기록되었습니다.",
      content: {
        "application/json": { schema: CreateSessionCheckinResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const listSessionActivitiesRoute = createRoute({
  tags: ["sessions"],
  method: "get",
  path: "/api/session-runs/{runId}/activities",
  summary: "Session Activities 조회",
  description: "세션 런에 기록된 액티비티 로그를 조회합니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "액티비티 목록을 반환합니다.",
      content: {
        "application/json": { schema: ListSessionActivitiesResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createSessionActivityRoute = createRoute({
  tags: ["sessions"],
  method: "post",
  path: "/api/session-runs/{runId}/activities",
  summary: "Session Activity 기록",
  description: "세션 런에 학습 액티비티를 기록합니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: CreateSessionActivityRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: "액티비티가 기록되었습니다.",
      content: {
        "application/json": { schema: CreateSessionActivityResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const updateSessionRunProgressRoute = createRoute({
  tags: ["sessions"],
  method: "patch",
  path: "/api/session-runs/{runId}/progress",
  summary: "Session Run 진행 저장",
  description:
    "학습 진행 상황을 저장합니다. 현재 읽고 있는 개념 위치 등을 기록합니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: UpdateSessionRunProgressRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "진행이 저장되었습니다.",
      content: {
        "application/json": { schema: UpdateSessionRunProgressResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const completeSessionRunRoute = createRoute({
  tags: ["sessions"],
  method: "post",
  path: "/api/session-runs/{runId}/complete",
  summary: "Session Run 완료",
  description:
    "학습 세션을 정상적으로 완료 처리합니다. 학습 시간이 기록됩니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Session Run이 완료되었습니다.",
      content: {
        "application/json": { schema: CompleteSessionRunResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const abandonSessionRunRoute = createRoute({
  tags: ["sessions"],
  method: "post",
  path: "/api/session-runs/{runId}/abandon",
  summary: "Session Run 중단",
  description: "학습 세션을 중단합니다. 중단 사유를 함께 기록할 수 있습니다.",
  request: {
    params: z.object({ runId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: AbandonSessionRunRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Session Run이 중단되었습니다.",
      content: {
        "application/json": { schema: AbandonSessionRunResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const sessionRoutes = [
  homeQueueRoute,
  createSessionRunRoute,
  updatePlanSessionRoute,
  listSessionRunsRoute,
  getSessionRunDetailRoute,
  listSessionCheckinsRoute,
  createSessionCheckinRoute,
  listSessionActivitiesRoute,
  createSessionActivityRoute,
  updateSessionRunProgressRoute,
  completeSessionRunRoute,
  abandonSessionRunRoute,
] as const;
