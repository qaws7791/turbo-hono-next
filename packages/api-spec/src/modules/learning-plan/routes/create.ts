import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanCreateRequestSchema,
  LearningPlanCreateResponseSchema,
} from "../../learning-plan/schema";

export const createLearningPlanRoute = createRoute({
  tags: ["plans"],
  method: "post",
  path: "/plans",
  summary: "새 LearningPlan을 생성합니다",
  description: `새 학습 계획을 만들 때 사용하는 엔드포인트입니다. 온보딩에서
사용자가 목표와 선호도를 제출한 직후 호출하면 자연스러운 흐름을 만들 수
있습니다.

- **입력 형식**: LearningPlanCreateRequestSchema 규격을 지키지 않으면 400을
  반환합니다. 잘못된 데이터로 AI 추천 품질이 떨어지는 것을 막기 위한
  방어선입니다.
- **템플릿 재사용**: 같은 템플릿으로 여러 계획을 만들 수 있지만 각
  LearningPlan은 별도 레코드로 저장됩니다. 진행 상황을 개별적으로 추적하기
  위한 설계입니다.
- **인증 요건**: cookieAuth 세션이 없으면 401을 반환합니다. 타인이 임의로
  LearningPlan을 생성해 계정을 오염시키는 것을 예방하기 위함입니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: LearningPlanCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "LearningPlan을 생성했습니다.",
      content: {
        "application/json": {
          schema: LearningPlanCreateResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
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
