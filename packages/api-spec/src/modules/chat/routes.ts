import { createRoute, z } from "@hono/zod-openapi";

import { ErrorResponseSchema } from "../../common/schema";

import {
  CreateChatMessageRequestSchema,
  CreateChatMessageResponseSchema,
  CreateChatThreadRequestSchema,
  CreateChatThreadResponseSchema,
  ListChatMessagesResponseSchema,
} from "./schema";

export const createChatThreadRoute = createRoute({
  tags: ["chat"],
  method: "post",
  path: "/api/chat/threads",
  summary: "채팅 스레드 생성",
  description: "AI 튜터와 대화할 새 채팅 스레드를 생성합니다.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateChatThreadRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "채팅 스레드가 생성되었습니다.",
      content: {
        "application/json": { schema: CreateChatThreadResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createChatMessageRoute = createRoute({
  tags: ["chat"],
  method: "post",
  path: "/api/chat/threads/{threadId}/messages",
  summary: "메시지 전송",
  description:
    "AI 튜터에게 질문을 보내고 답변을 받습니다. 학습 자료 컨텍스트 기반으로 응답합니다.",
  request: {
    params: z.object({ threadId: z.uuid() }),
    body: {
      content: {
        "application/json": { schema: CreateChatMessageRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "AI 답변을 반환합니다.",
      content: {
        "application/json": { schema: CreateChatMessageResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const listChatMessagesRoute = createRoute({
  tags: ["chat"],
  method: "get",
  path: "/api/chat/threads/{threadId}/messages",
  summary: "스레드 메시지 목록",
  description: "채팅 스레드의 전체 대화 내역을 조회합니다.",
  request: {
    params: z.object({ threadId: z.uuid() }),
  },
  responses: {
    200: {
      description: "메시지 목록을 반환합니다.",
      content: {
        "application/json": { schema: ListChatMessagesResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const chatRoutes = [
  createChatThreadRoute,
  createChatMessageRoute,
  listChatMessagesRoute,
] as const;
