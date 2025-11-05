import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanListQuerySchema,
  LearningPlanListResponseSchema,
} from "../../learning-plan/schema";

export const learningPlanListRoute = createRoute({
  tags: ["plans"],
  method: "get",
  path: "/plans",
  summary: "LearningPlan 목록을 조회합니다",
  description: `사용자의 LearningPlan을 필터와 페이지네이션으로 조회합니다.

- **필터 제한**: LearningPlanListQuerySchema 범위를 벗어나면 400을 반환합니다.
  이는 과도한 페이지 크기 요청으로 인한 부하를 예방하기 위함입니다.
- **정렬 정책**: 기본 정렬은 최신 생성 순이며 추가 정렬 옵션은 추후
  확장됩니다.
- **세션 요구**: 로그인한 사용자 데이터만 반환해 타 사용자 목록 노출을
  차단합니다.`,
  request: {
    query: LearningPlanListQuerySchema,
  },
  responses: {
    200: {
      description: "LearningPlan 목록을 불러왔습니다.",
      content: {
        "application/json": {
          schema: LearningPlanListResponseSchema,
        },
      },
    },
    400: {
      description: "요청 파라미터가 유효하지 않습니다.",
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
