import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningTaskCreateRequestSchema,
  LearningTaskCreateResponseSchema,
} from "../../../learning-plan/schema";

export const createLearningTaskRoute = createRoute({
  tags: ["tasks"],
  method: "post",
  path: "/tasks",
  summary: "LearningModule에 LearningTask를 추가합니다",
  description: `학습 모듈에 새 LearningTask를 생성해 실행 가능한 단위를
  정의합니다.

- **입력 검증**: LearningTaskCreateRequestSchema를 만족하지 않으면 400을
  반환합니다. 이는 잘못된 태스크 구성을 방지하기 위한 정책입니다.
- **권한 확인**: LearningPlan 소유자가 아니라면 403을 반환해 무단 추가를
  막습니다.
- **순서 정책**: 새 태스크는 모듈 마지막에 추가되며 move API로 재배치할 수
  있습니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: LearningTaskCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "LearningTask를 생성했습니다.",
      content: {
        "application/json": {
          schema: LearningTaskCreateResponseSchema,
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
