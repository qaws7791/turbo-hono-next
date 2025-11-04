import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateLearningTaskNoteParamsSchema,
  GenerateLearningTaskNoteResponseSchema,
} from "../../../ai/schema";

export const getLearningTaskNoteRoute = createRoute({
  tags: ["learning-tasks"],
  method: "get",
  path: "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/notes",
  summary: "AI가 생성한 LearningTask 노트를 조회합니다",
  description: `해당 LearningTask에 대해 생성된 AI 노트와 상태를 반환합니다.

- **존재 여부**: 노트가 없으면 status가 idle로 반환됩니다. AI 생성 전 상태를
  구분하기 위한 정책입니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환합니다. 학습 노트
  유출을 막기 위한 조치입니다.
- **동기화**: generateLearningTaskNoteRoute 호출 직후에는 status가 pending일 수
  있으므로 폴링 간격을 조정해야 합니다.`,
  request: {
    params: GenerateLearningTaskNoteParamsSchema,
  },
  responses: {
    200: {
      description: "AI 노트를 불러왔습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
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
      description: "LearningPlan 또는 LearningTask를 찾을 수 없습니다.",
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
