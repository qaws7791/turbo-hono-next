import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningTaskMoveRequestSchema,
  LearningTaskMoveResponseSchema,
  LearningTaskParamsSchema,
} from "../../../learning-plan/schema";

export const moveLearningTaskRoute = createRoute({
  tags: ["learning-tasks"],
  method: "patch",
  path: "/learning-tasks/{id}/move",
  summary: "LearningTask를 다른 LearningModule로 이동하거나 순서를 조정합니다",
  description: `LearningTask를 다른 LearningModule로 옮기거나 동일 모듈 내
  순서를 변경합니다.

- **입력 검증**: LearningTaskMoveRequestSchema 범위를 벗어나면 400을
  반환합니다. 이는 잘못된 이동으로 인한 순서 꼬임을 막기 위한 정책입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환합니다. 학습 계획
  무단 수정을 방지합니다.
- **원자성**: 이동과 순서 조정이 단일 트랜잭션으로 처리되어 중간 상태가
  노출되지 않습니다.`,
  request: {
    params: LearningTaskParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningTaskMoveRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningTask를 이동했습니다.",
      content: {
        "application/json": {
          schema: LearningTaskMoveResponseSchema,
        },
      },
    },
    400: {
      description: "요청 본문이 검증을 통과하지 못했습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "인증이 필요합니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "LearningPlan 소유자가 아니므로 접근할 수 없습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description:
        "LearningPlan, LearningModule 또는 LearningTask를 찾을 수 없습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "서버 내부 오류가 발생했습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});
