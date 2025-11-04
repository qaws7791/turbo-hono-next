import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleCreateRequestSchema,
  LearningModuleCreateResponseSchema,
  LearningPlanParamsSchema,
} from "../../../learning-plan/schema";

export const createLearningModuleRoute = createRoute({
  tags: ["learning-modules"],
  method: "post",
  path: "/learning-plans/{learningPlanId}/learning-modules",
  summary: "LearningPlan에 LearningModule을 추가합니다",
  description: `학습 계획에 새로운 LearningModule을 생성해 학습 단위를
  구성합니다.

- **입력 검증**: LearningModuleCreateRequestSchema를 충족하지 못하면 400을
  반환합니다. 이는 불완전한 모듈 생성을 방지하기 위한 정책입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환합니다. 학습 구조를
  임의로 변경하지 못하도록 하기 위함입니다.
- **순서 정책**: 새 모듈은 기본적으로 마지막 위치에 추가되며 reorder API로
  재정렬할 수 있습니다.`,
  request: {
    params: LearningPlanParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningModuleCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "LearningModule을 생성했습니다.",
      content: {
        "application/json": {
          schema: LearningModuleCreateResponseSchema,
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
