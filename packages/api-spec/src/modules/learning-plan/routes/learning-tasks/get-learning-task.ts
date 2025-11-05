import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningTaskDetailResponseSchema,
  LearningTaskParamsSchema,
} from "../../../learning-plan/schema";

export const getLearningTaskRoute = createRoute({
  tags: ["tasks"],
  method: "get",
  path: "/tasks/{id}",
  summary: "LearningTask 상세 정보를 조회합니다",
  description: `LearningTask의 목표, 예상 소요 시간 등 세부 정보를 반환합니다.

- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환해 민감한 진척도를
  보호합니다.
- **연관 데이터**: 학습 기록과 노트는 별도 API에서 제공되므로 필요한 경우
  추가 호출이 필요합니다.
- **실시간성**: 진행 상황이 자주 변하므로 캐시 만료 시간을 짧게 유지해야
  합니다.`,
  request: {
    params: LearningTaskParamsSchema,
  },
  responses: {
    200: {
      description: "LearningTask 상세 정보를 불러왔습니다.",
      content: {
        "application/json": {
          schema: LearningTaskDetailResponseSchema,
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
