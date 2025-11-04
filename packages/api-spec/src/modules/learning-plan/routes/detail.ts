import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanDetailResponseSchema,
  LearningPlanParamsSchema,
} from "../../learning-plan/schema";

export const learningPlanDetailRoute = createRoute({
  tags: ["learning-plans"],
  method: "get",
  path: "/learning-plans/{learningPlanId}",
  summary: "LearningPlan과 하위 구조를 조회합니다",
  description: `LearningPlan과 연결된 LearningModule, LearningTask 세부 정보를
  함께 반환합니다.

- **권한 검증**: 소유자가 아니면 403을 반환합니다. 개인화된 진척도를
  보호하기 위한 조치입니다.
- **지연 로딩**: 무거운 통계 필드는 별도 API에서 제공될 수 있습니다.
- **캐시 주의**: 학습 진행이 자주 변하므로 짧은 만료 시간으로 캐시하거나
  매 호출마다 최신 데이터를 받아야 합니다.`,
  request: {
    params: LearningPlanParamsSchema,
  },
  responses: {
    200: {
      description: "LearningPlan 상세 정보를 불러왔습니다.",
      content: {
        "application/json": {
          schema: LearningPlanDetailResponseSchema,
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
      description: "이 LearningPlan에 접근할 수 없습니다.",
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
