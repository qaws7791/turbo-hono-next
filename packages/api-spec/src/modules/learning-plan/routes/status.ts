import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanParamsSchema,
  LearningPlanStatusChangeRequestSchema,
  LearningPlanStatusChangeResponseSchema,
} from "../../learning-plan/schema";

export const learningPlanStatusRoute = createRoute({
  tags: ["plans"],
  method: "patch",
  path: "/plans/{id}/status",
  summary: "LearningPlan 상태를 변경합니다",
  description: `LearningPlan의 상태를 active 또는 archived 등으로 전환합니다.

- **상태 검증**: 이미 동일한 상태면 409를 반환합니다. 불필요한 업데이트를
  막아 데이터 일관성을 유지합니다.
- **권한 확인**: 소유자가 아니면 403을 반환합니다. 이는 학습 계획 무단
  변경을 방지하기 위함입니다.
- **후속 처리**: 상태 변경 후 클라이언트는 숨김 처리나 알림 재전송 등
  추가 동작이 필요할 수 있습니다.`,
  request: {
    params: LearningPlanParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningPlanStatusChangeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningPlan 상태를 변경했습니다.",
      content: {
        "application/json": {
          schema: LearningPlanStatusChangeResponseSchema,
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
