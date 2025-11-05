import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanDeletionResponseSchema,
  LearningPlanParamsSchema,
} from "../../learning-plan/schema";

export const deleteLearningPlanRoute = createRoute({
  tags: ["plans"],
  method: "delete",
  path: "/plans/{id}",
  summary: "LearningPlan을 삭제합니다",
  description: `LearningPlan과 연관된 LearningModule, LearningTask를 함께
  삭제합니다.

- **권한 검증**: 소유자가 아니면 403을 반환합니다. 개인 학습 자산 보호를
  위한 정책입니다.
- **연쇄 삭제**: 하위 리소스가 모두 제거되며 복구가 불가능하므로 수행 전
  백업이 필요할 수 있습니다.
- **동기 처리**: 삭제 완료 후 응답을 반환해 후속 읽기 요청의 일관성을
  보장합니다.`,
  request: {
    params: LearningPlanParamsSchema,
  },
  responses: {
    200: {
      description: "LearningPlan을 삭제했습니다.",
      content: {
        "application/json": {
          schema: LearningPlanDeletionResponseSchema,
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
      description: "소유자가 아니므로 접근할 수 없습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "LearningPlan을 찾을 수 없습니다.",
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
