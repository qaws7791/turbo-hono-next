import { createRoute, z } from "@hono/zod-openapi";

import { ErrorResponseSchema, PublicIdSchema } from "../../common/schema";

import {
  AbandonSessionRunRequestSchema,
  AbandonSessionRunResponseSchema,
  CompleteSessionRunResponseSchema,
  CreateSessionRunResponseSchema,
  HomeQueueResponseSchema,
  UpdateSessionRunProgressRequestSchema,
  UpdateSessionRunProgressResponseSchema,
} from "./schema";

export const homeQueueRoute = createRoute({
  tags: ["sessions"],
  method: "get",
  path: "/api/home/queue",
  summary: "오늘 할 일 큐 조회",
  description:
    "오늘 학습해야 할 세션 목록을 조회합니다. 복습 예정 개념을 포함합니다.",
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
  updateSessionRunProgressRoute,
  completeSessionRunRoute,
  abandonSessionRunRoute,
] as const;
