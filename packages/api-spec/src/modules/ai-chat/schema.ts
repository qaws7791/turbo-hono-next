import { z } from "@hono/zod-openapi";

import { ErrorResponseSchema } from "../../common/schema";

/**
 * Stored Tool Invocation 스키마
 * Tool call과 result를 결합한 저장 형식
 */
export const StoredToolInvocationSchema = z.object({
  toolCallId: z.string().openapi({
    description: "Tool call 고유 ID",
    examples: ["call_1234567890"],
  }),
  toolName: z.string().openapi({
    description: "호출된 tool 이름",
    examples: ["getLearningModule"],
  }),
  arguments: z.record(z.string(), z.unknown()).openapi({
    description: "Tool에 전달된 인자",
  }),
  result: z.unknown().optional().openapi({
    description: "Tool 실행 결과",
  }),
  providerExecuted: z.boolean().optional().openapi({
    description: "Provider에 의해 실행되었는지 여부",
  }),
  error: z.unknown().optional().openapi({
    description: "Tool 실행 중 발생한 에러",
  }),
});

/**
 * 메시지 스키마
 */
export const MessageSchema = z
  .object({
    id: z.string().openapi({
      description: "메시지 고유 ID",
      examples: ["msg_1234567890"],
    }),
    conversationId: z.string().openapi({
      description: "대화 세션 ID",
      examples: ["conv_1234567890"],
    }),
    role: z.enum(["user", "assistant", "tool"]).openapi({
      description: "메시지 역할",
      examples: ["user"],
    }),
    content: z.string().openapi({
      description: "메시지 내용",
      examples: ["React Hooks 모듈을 추가해줘"],
    }),
    toolInvocations: z.array(StoredToolInvocationSchema).optional().openapi({
      description: "Tool 호출 정보 (call과 result를 결합한 저장 형식)",
    }),
    createdAt: z.string().openapi({
      description: "생성 시간 (ISO 8601)",
      examples: ["2025-11-13T10:00:00.000Z"],
    }),
  })
  .openapi("Message");

/**
 * 대화 세션 스키마
 */
export const ConversationSchema = z
  .object({
    id: z.string().openapi({
      description: "대화 세션 고유 ID",
      examples: ["conv_1234567890"],
    }),
    learningPlanId: z
      .number()
      .int()
      .openapi({
        description: "학습 계획 ID",
        examples: [1],
      }),
    userId: z.string().openapi({
      description: "사용자 ID",
      examples: ["user_1234567890"],
    }),
    title: z
      .string()
      .nullable()
      .openapi({
        description: "대화 제목 (선택사항)",
        examples: ["React Hooks 학습 계획"],
      }),
    createdAt: z.string().openapi({
      description: "생성 시간 (ISO 8601)",
      examples: ["2025-11-13T10:00:00.000Z"],
    }),
    updatedAt: z.string().openapi({
      description: "수정 시간 (ISO 8601)",
      examples: ["2025-11-13T10:00:00.000Z"],
    }),
  })
  .openapi("Conversation");

/**
 * 대화 세션 목록 조회 응답 스키마
 */
export const ConversationListResponseSchema = z
  .object({
    conversations: z.array(ConversationSchema).openapi({
      description: "대화 세션 목록",
    }),
    totalCount: z
      .number()
      .int()
      .openapi({
        description: "전체 대화 세션 개수",
        examples: [5],
      }),
  })
  .openapi("ConversationListResponse");

/**
 * 메시지 전송 요청 스키마
 */
export const SendMessageRequestSchema = z
  .object({
    conversationId: z
      .string()
      .optional()
      .openapi({
        description: "대화 세션 ID (없으면 새 대화 세션 생성)",
        examples: ["conv_1234567890"],
      }),
    learningPlanId: z
      .number()
      .int()
      .openapi({
        description: "학습 계획 ID (conversationId가 없을 때 필수)",
        examples: [1],
      }),
    message: z
      .string()
      .min(1)
      .max(5000)
      .openapi({
        description: "사용자 메시지",
        examples: ["React Hooks 모듈을 추가해줘"],
      }),
  })
  .openapi("SendMessageRequest");

/**
 * 메시지 목록 조회 응답 스키마
 */
export const MessageListResponseSchema = z
  .object({
    messages: z.array(MessageSchema).openapi({
      description: "메시지 목록",
    }),
    totalCount: z
      .number()
      .int()
      .openapi({
        description: "전체 메시지 개수",
        examples: [10],
      }),
  })
  .openapi("MessageListResponse");

/**
 * 대화 세션 생성 요청 스키마
 */
export const CreateConversationRequestSchema = z
  .object({
    learningPlanId: z
      .number()
      .int()
      .openapi({
        description: "학습 계획 ID",
        examples: [1],
      }),
    title: z
      .string()
      .optional()
      .openapi({
        description: "대화 제목 (선택사항)",
        examples: ["React Hooks 학습 계획"],
      }),
  })
  .openapi("CreateConversationRequest");

/**
 * 공통 에러 응답
 */
export { ErrorResponseSchema };
