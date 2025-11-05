import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningTaskDeletionResponseSchema,
  LearningTaskParamsSchema,
} from "../../../learning-plan/schema";

export const deleteLearningTaskRoute = createRoute({
  tags: ["tasks"],
  method: "delete",
  path: "/tasks/{id}",
  summary: "LearningTask를 삭제합니다",
  description: `LearningModule에서 지정된 LearningTask와 관련 AI 산출물을
  제거합니다.

- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환합니다. 학습 데이터
  무단 삭제를 막기 위한 정책입니다.
- **연쇄 삭제**: 관련 노트와 퀴즈 결과가 함께 제거되므로 필요 시 사전
  백업이 필요합니다.
- **데이터 보존**: 삭제 후 복구가 불가능하므로 기록이 필요하다면 먼저
  export 기능을 활용해야 합니다.`,
  request: {
    params: LearningTaskParamsSchema,
  },
  responses: {
    200: {
      description: "LearningTask를 삭제했습니다.",
      content: {
        "application/json": {
          schema: LearningTaskDeletionResponseSchema,
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
