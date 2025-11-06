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
  tags: ["quizzes"],
  method: "post",
  path: "/quizzes/{id}/submit",
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
