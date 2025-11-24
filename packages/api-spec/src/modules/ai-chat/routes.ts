import { createRoute, z } from "@hono/zod-openapi";

import {
  ConversationDetailResponseSchema,
  ConversationListResponseSchema,
  ConversationSchema,
  CreateConversationRequestSchema,
  ErrorResponseSchema,
  MessageListResponseSchema,
} from "./schema";

/**
 * POST /chat/stream - 스트리밍 메시지 전송 (SSE)
 */
export const streamMessageRoute = createRoute({
  tags: ["ai-chat"],
  method: "post",
  path: "/chat/stream",
  summary: "AI 튜터에게 메시지를 전송하고 스트리밍 응답을 받습니다",
  description: `사용자가 AI 튜터와 대화하며 학습 계획을 관리할 수 있는 스트리밍 API입니다.

- **스트리밍 응답**: SSE(Server-Sent Events)를 사용하여 실시간으로 AI 응답을 받습니다.
- **Tool Calling**: AI가 필요시 학습 모듈, 태스크 등을 생성/수정/삭제할 수 있습니다.
- **컨텍스트 인식**: 현재 학습 계획의 모든 정보를 컨텍스트로 제공합니다.
- **대화 세션 자동 생성**: conversationId가 없으면 새 대화 세션을 자동으로 생성합니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.looseObject({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "스트리밍 응답 (SSE)",
      content: {
        "text/event-stream": {
          schema: z.unknown(),
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

/**
 * GET /chat/conversations - 학습 계획의 대화 세션 목록 조회
 */
export const getConversationsRoute = createRoute({
  tags: ["ai-chat"],
  method: "get",
  path: "/chat/conversations",
  summary: "학습 계획의 대화 세션 목록을 조회합니다",
  description: `특정 학습 계획에 속한 모든 대화 세션을 조회합니다.

- **최신순 정렬**: updatedAt 기준으로 최신 대화가 먼저 표시됩니다.
- **권한 확인**: 학습 계획 소유자만 조회할 수 있습니다.`,
  request: {
    query: z.object({
      learningPlanId: z.string().openapi({
        description: "학습 계획 Public ID",
        examples: ["plan_abc123"],
      }),
    }),
  },
  responses: {
    200: {
      description: "대화 세션 목록",
      content: {
        "application/json": {
          schema: ConversationListResponseSchema,
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

/**
 * GET /chat/conversations/:conversationId/messages - 대화 세션의 메시지 목록 조회
 */
export const getMessagesRoute = createRoute({
  tags: ["ai-chat"],
  method: "get",
  path: "/chat/conversations/{conversationId}/messages",
  summary: "대화 세션의 메시지 목록을 조회합니다",
  description: `특정 대화 세션의 모든 메시지를 조회합니다.

- **시간순 정렬**: createdAt 기준으로 오래된 메시지부터 표시됩니다.
- **권한 확인**: 대화 세션 소유자만 조회할 수 있습니다.
- **Tool 호출 정보 포함**: 각 메시지에 Tool 호출 정보가 포함됩니다.`,
  request: {
    params: z.object({
      conversationId: z
        .string()
        .min(1)
        .openapi({
          description: "대화 세션 ID",
          examples: ["conv_1234567890"],
        }),
    }),
  },
  responses: {
    200: {
      description: "메시지 목록",
      content: {
        "application/json": {
          schema: MessageListResponseSchema,
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

/**
 * GET /chat/conversations/{conversationId} - 대화 세션 상세 조회 (메시지 포함)
 */
export const getConversationDetailRoute = createRoute({
  tags: ["ai-chat"],
  method: "get",
  path: "/chat/conversations/{conversationId}",
  summary: "대화 세션 상세 정보와 메시지 목록을 조회합니다",
  description: `특정 대화 세션의 상세 정보와 모든 메시지를 한 번에 조회합니다.

- **시간순 정렬**: 메시지는 createdAt 기준으로 오래된 메시지부터 표시됩니다.
- **권한 확인**: 대화 세션 소유자만 조회할 수 있습니다.
- **전체 컨텍스트**: 대화의 모든 메시지를 포함하여 전체 맥락을 제공합니다.`,
  request: {
    params: z.object({
      conversationId: z
        .string()
        .min(1)
        .openapi({
          description: "대화 세션 ID",
          examples: ["conv_1234567890"],
        }),
    }),
  },
  responses: {
    200: {
      description: "대화 세션 상세 정보",
      content: {
        "application/json": {
          schema: ConversationDetailResponseSchema,
        },
      },
    },
    404: {
      description: "대화 세션을 찾을 수 없음",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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

/**
 * POST /chat/conversations - 새 대화 세션 생성
 */
export const createConversationRoute = createRoute({
  tags: ["ai-chat"],
  method: "post",
  path: "/chat/conversations",
  summary: "새 대화 세션을 생성합니다",
  description: `학습 계획에 새로운 대화 세션을 생성합니다.

- **자동 ID 생성**: 고유한 대화 세션 ID가 자동으로 생성됩니다.
- **권한 확인**: 학습 계획 소유자만 대화 세션을 생성할 수 있습니다.`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateConversationRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "생성된 대화 세션",
      content: {
        "application/json": {
          schema: ConversationSchema,
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

/**
 * DELETE /chat/conversations/:conversationId - 대화 세션 삭제
 */
export const deleteConversationRoute = createRoute({
  tags: ["ai-chat"],
  method: "delete",
  path: "/chat/conversations/{conversationId}",
  summary: "대화 세션을 삭제합니다",
  description: `대화 세션과 관련된 모든 메시지를 삭제합니다.

- **CASCADE 삭제**: 대화 세션에 속한 모든 메시지가 함께 삭제됩니다.
- **권한 확인**: 대화 세션 소유자만 삭제할 수 있습니다.`,
  request: {
    params: z.object({
      conversationId: z
        .string()
        .min(1)
        .openapi({
          description: "대화 세션 ID",
          examples: ["conv_1234567890"],
        }),
    }),
  },
  responses: {
    204: {
      description: "삭제 완료",
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

export const aiChatRoutes = [
  streamMessageRoute,
  getConversationsRoute,
  getConversationDetailRoute,
  getMessagesRoute,
  createConversationRoute,
  deleteConversationRoute,
] as const;
