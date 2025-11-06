import { createRoute } from "@hono/zod-openapi";

import {
  LearningModuleActivityQuerySchema,
  LearningModuleActivityResponseSchema,
  ProgressSchemas,
} from "./schema";

export const dailyProgressRoute = createRoute({
  tags: ["progress"],
  method: "get",
  path: "/progress/daily",
  summary: "일별 학습 모듈 활동량을 조회합니다",
  description: `지정된 기간 동안 LearningModule의 예정·완료 수치를 집계합니다.

- **기간 제한**: LearningModuleActivityQuerySchema 허용 범위를 넘으면
  400을 반환합니다. 이는 과도한 데이터 스캔을 방지하기 위한 정책입니다.
- **시간대 기준**: 모든 날짜는 서버 기본 타임존(UTC) 기준으로 계산됩니다.
- **인증 필수**: cookieAuth 세션 없이는 401을 반환해 타인 데이터 접근을
  차단합니다.`,
  request: {
    query: LearningModuleActivityQuerySchema,
  },
  responses: {
    200: {
      description: "일별 활동 데이터를 불러왔습니다.",
      content: {
        "application/json": {
          schema: LearningModuleActivityResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: ProgressSchemas.ErrorResponseSchema,
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

export const progressRoutes = [dailyProgressRoute] as const;
