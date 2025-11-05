import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanParamsSchema,
  LearningPlanUpdateRequestSchema,
  LearningPlanUpdateResponseSchema,
} from "../../learning-plan/schema";

export const updateLearningPlanRoute = createRoute({
  tags: ["plans"],
  method: "patch",
  path: "/plans/{id}",
  summary: "LearningPlan 메타데이터를 수정합니다",
  description: `LearningPlan의 제목, 설명 등 주요 속성을 갱신합니다.

- **입력 검증**: LearningPlanUpdateRequestSchema 요구 사항을 충족하지 못하면
  400을 반환합니다. 이는 불완전한 데이터 저장을 막기 위한 정책입니다.
- **동시성 관리**: 마지막 수정 시간을 사용해 클라이언트가 낙관적 업데이트를
  적용해야 합니다.
- **권한 확인**: 소유자가 아니면 403을 반환합니다. 학습 계획 무단 편집을
  차단합니다.`,
  request: {
    params: LearningPlanParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningPlanUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningPlan을 수정했습니다.",
      content: {
        "application/json": {
          schema: LearningPlanUpdateResponseSchema,
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
