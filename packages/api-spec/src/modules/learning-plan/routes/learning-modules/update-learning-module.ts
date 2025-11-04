import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleUpdateRequestSchema,
  LearningModuleUpdateResponseSchema,
  LearningPlanLearningModuleParamsSchema,
} from "../../../learning-plan/schema";

export const updateLearningModuleRoute = createRoute({
  tags: ["learning-modules"],
  method: "put",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}",
  summary: "LearningModule 정보를 수정합니다",
  description: `LearningModule의 제목과 설명 등 핵심 속성을 갱신합니다.

- **입력 검증**: LearningModuleUpdateRequestSchema 요구 사항을 만족하지 못하면
  400을 반환합니다. 불완전한 데이터 저장을 막기 위한 조치입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환합니다. 모듈 무단
  수정을 방지합니다.
- **동기화**: 변경 내용이 학습 일정과 연동되므로 클라이언트는 목록을
  재조회해 최신 상태를 반영해야 합니다.`,
  request: {
    params: LearningPlanLearningModuleParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningModuleUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningModule을 수정했습니다.",
      content: {
        "application/json": {
          schema: LearningModuleUpdateResponseSchema,
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
