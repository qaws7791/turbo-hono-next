import { createRoute, z } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateLearningPlanRequestSchema,
  GenerateLearningPlanResponseSchema,
  GenerateLearningTaskNoteQuerySchema,
  GenerateLearningTaskNoteResponseSchema,
  GenerateLearningTaskQuizQuerySchema,
  GenerateLearningTaskQuizResponseSchema,
} from "./schema";

export const generateLearningPlanRoute = createRoute({
  tags: ["ai"],
  method: "post",
  path: "/ai/plans/generate",
  summary: "AI로 맞춤 LearningPlan을 생성합니다",
  description: `사용자 목표와 선호도를 기반으로 AI가 LearningPlan을 제안합니다.

- **입력 검증**: GenerateLearningPlanRequestSchema 요건을 충족하지 않으면
  400을 반환합니다. 이는 모델 품질 저하를 막기 위한 전처리입니다.
- **요금 보호**: 요청이 과도하면 429를 반환합니다. AI 사용량을 제어하기
  위한 정책입니다.
- **세션 요구**: 인증된 사용자만 호출할 수 있어 개인 데이터에 맞는 계획을
  제공합니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: GenerateLearningPlanRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningPlan을 생성했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningPlanResponseSchema,
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
    429: {
      description: "요청 한도를 초과했습니다.",
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

export const generateLearningTaskNoteRoute = createRoute({
  tags: ["tasks"],
  method: "post",
  path: "/tasks/{id}/notes",
  summary: "AI로 LearningTask 노트를 생성하거나 새로고침합니다",
  description: `LearningTask에 연결된 AI 노트를 생성하고 현재 상태를 반환합니다.

- **비동기 처리**: 새 노트를 생성하면 202를 반환하고 백그라운드에서
  텍스트를 작성합니다.
- **상태 재사용**: 이미 생성 중이라면 200으로 최신 상태를 그대로 제공합니다.
- **권한 확인**: LearningPlan 소유자가 아니면 403을 반환해 노트 노출을
  막습니다.`,
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: "LearningTask 공개 ID",
        example: "660e8400-e29b-41d4-a716-446655440001",
      }),
    }),
    query: GenerateLearningTaskNoteQuerySchema,
  },
  responses: {
    202: {
      description: "노트 생성을 시작했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    200: {
      description: "기존 노트 상태를 반환했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    400: {
      description: "요청이 유효하지 않습니다.",
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
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    403: {
      description: "접근 권한이 없습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    404: {
      description: "대상 LearningPlan 또는 LearningTask를 찾을 수 없습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    500: {
      description: "노트 생성 중 서버 오류가 발생했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
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

export const generateLearningTaskQuizRoute = createRoute({
  tags: ["tasks"],
  method: "post",
  path: "/tasks/{id}/quizzes",
  summary: "AI로 LearningTask 퀴즈를 생성하거나 새로고침합니다",
  description: `LearningTask 내용에 맞춘 AI 퀴즈를 생성하고 상태를 반환합니다.

- **비동기 처리**: 새 퀴즈를 만들면 202를 반환하고 생성이 끝날 때까지
  진행 상황만 제공합니다.
- **재사용 정책**: 기존 퀴즈가 최신이면 200으로 현재 데이터를 반환합니다.
- **접근 제어**: 학습자 본인이 아니면 403을 반환해 학습 데이터 유출을
  방지합니다.`,
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: "LearningTask 공개 ID",
        example: "660e8400-e29b-41d4-a716-446655440001",
      }),
    }),
    query: GenerateLearningTaskQuizQuerySchema,
  },
  responses: {
    202: {
      description: "퀴즈 생성을 시작했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    200: {
      description: "기존 퀴즈 상태를 반환했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    400: {
      description: "요청이 유효하지 않습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    401: {
      description: "인증이 필요합니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    403: {
      description: "접근 권한이 없습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    404: {
      description: "대상 LearningPlan 또는 LearningTask를 찾을 수 없습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    500: {
      description: "퀴즈 생성 중 서버 오류가 발생했습니다.",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
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

export const aiRoutes = [
  generateLearningPlanRoute,
  generateLearningTaskNoteRoute,
  generateLearningTaskQuizRoute,
] as const;
