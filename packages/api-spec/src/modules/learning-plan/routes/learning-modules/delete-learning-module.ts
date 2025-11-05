import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleDeletionResponseSchema,
  LearningModuleParamsSchema,
} from "../../../learning-plan/schema";

export const deleteLearningModuleRoute = createRoute({
  tags: ["modules"],
  method: "delete",
  path: "/modules/{id}",
  summary: "LearningModule을 삭제합니다",
  description: `LearningPlan에서 지정된 LearningModule과 하위 LearningTask를
  제거합니다.

- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환해 구조 변경을
  차단합니다.
- **연쇄 삭제**: 연결된 LearningTask가 모두 삭제되므로 필요 시 사전 백업이
  요구됩니다.
- **일정 영향**: 삭제 직후 Progress API에 반영되기까지 약간의 지연이 있을 수
  있습니다.`,
  request: {
    params: LearningModuleParamsSchema,
  },
  responses: {
    200: {
      description: "LearningModule을 삭제했습니다.",
      content: {
        "application/json": {
          schema: LearningModuleDeletionResponseSchema,
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
