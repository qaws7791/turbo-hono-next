import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningTaskQuizParamsSchema,
} from "../../../learning-plan/schema";
import {
  SubmitLearningTaskQuizRequestSchema,
  SubmitLearningTaskQuizResponseSchema,
} from "../../../ai/schema";

export const submitLearningTaskQuizRoute = createRoute({
  tags: ["learning-tasks"],
  method: "post",
  path: "/learning-task-quizzes/{id}/submit",
  summary: "LearningTask 퀴즈 답안을 제출합니다",
  description: `AI가 생성한 퀴즈에 대한 학습자의 답안을 제출하고 채점 결과를
  반환합니다.

- **입력 검증**: SubmitLearningTaskQuizRequestSchema 요구 사항을 충족하지
  않으면 400을 반환합니다. 이는 채점 오류를 방지하기 위한 정책입니다.
- **상태 제한**: 퀴즈가 ready 상태가 아니면 409를 반환합니다. 평가 중복을
  막기 위한 조치입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환해 타인 응시를
  차단합니다.`,
  request: {
    params: LearningTaskQuizParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SubmitLearningTaskQuizRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "퀴즈를 제출하고 채점을 완료했습니다.",
      content: {
        "application/json": {
          schema: SubmitLearningTaskQuizResponseSchema,
        },
      },
    },
    400: {
      description: "요청 본문이 유효하지 않습니다.",
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
      description: "접근 권한이 없습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "퀴즈, LearningTask 또는 LearningPlan을 찾을 수 없습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "퀴즈가 준비되지 않았거나 이미 제출되었습니다.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "퀴즈 제출 중 서버 오류가 발생했습니다.",
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
