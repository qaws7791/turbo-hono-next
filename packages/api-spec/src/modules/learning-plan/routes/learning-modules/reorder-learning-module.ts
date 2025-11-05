import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleParamsSchema,
  LearningModuleReorderRequestSchema,
  LearningModuleReorderResponseSchema,
} from "../../../learning-plan/schema";

export const reorderLearningModuleRoute = createRoute({
  tags: ["learning-modules"],
  method: "patch",
  path: "/learning-modules/{id}/order",
  summary: "LearningModule 순서를 재배치합니다",
  description: `지정한 LearningModule의 표시 순서를 변경합니다.

- **입력 검증**: LearningModuleReorderRequestSchema 범위를 벗어나면 400을
  반환합니다. 모듈 간 순서 일관성을 지키기 위한 정책입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환합니다. 무단 정렬
  변경을 막기 위한 조치입니다.
- **원자성**: 순서 변경은 트랜잭션으로 처리되어 중간 상태가 노출되지
  않습니다.`,
  request: {
    params: LearningModuleParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningModuleReorderRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningModule 순서를 재배치했습니다.",
      content: {
        "application/json": {
          schema: LearningModuleReorderResponseSchema,
        },
      },
    },
    400: {
      description: "요청한 순서 값이 유효하지 않습니다.",
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
      description: "LearningModule 또는 LearningPlan을 찾을 수 없습니다.",
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
