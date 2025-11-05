import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningTaskParamsSchema,
  LearningTaskUpdateRequestSchema,
  LearningTaskUpdateResponseSchema,
} from "../../../learning-plan/schema";

export const updateLearningTaskRoute = createRoute({
  tags: ["learning-tasks"],
  method: "put",
  path: "/learning-tasks/{id}",
  summary: "LearningTask 속성을 수정합니다",
  description: `LearningTask의 제목, 일정, 난이도 등을 갱신합니다.

- **입력 검증**: LearningTaskUpdateRequestSchema 요구 조건을 충족하지 못하면
  400을 반환합니다. 이는 데이터 무결성을 유지하기 위한 정책입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환해 무단 수정을
  막습니다.
- **동기화**: 변경 내용이 진척도 계산에 영향을 주므로 Progress API를
  사용하는 화면은 재조회가 필요합니다.`,
  request: {
    params: LearningTaskParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningTaskUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningTask를 수정했습니다.",
      content: {
        "application/json": {
          schema: LearningTaskUpdateResponseSchema,
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
