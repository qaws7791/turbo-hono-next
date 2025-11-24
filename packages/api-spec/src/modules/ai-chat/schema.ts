import { z } from "@hono/zod-openapi";
import { conversationSchema, storedMessageSchema } from "@repo/ai-types";

import { ErrorResponseSchema } from "../../common/schema";

/**
 * 메시지 스키마 (OpenAPI 메타데이터 추가)
 *
 * @remarks
 * AI SDK v5의 메시지 구조 사용:
 * - parts: 모든 메시지 내용 (text, tool 호출/결과, file 등)
 * - attachments: 파일 첨부 (선택적)
 */
export const MessageSchema = storedMessageSchema
  .extend({
    id: z.string().openapi({
      description: "메시지 고유 ID",
      examples: ["msg_1234567890"],
    }),
    conversationId: z.string().openapi({
      description: "대화 세션 ID",
      examples: ["conv_1234567890"],
    }),
    role: z.enum(["user", "assistant", "tool", "system"]).openapi({
      description: "메시지 역할",
      examples: ["user"],
    }),
    parts: z.array(z.unknown()).openapi({
      description:
        "메시지 parts (AI SDK v5 구조): text, tool 호출/결과, file 등 모든 메시지 내용 포함",
      examples: [
        [
          { type: "text", text: "React Hooks 모듈을 추가해줘" },
          {
            type: "tool-createModule",
            toolCallId: "call_123",
            state: "input-available",
            input: { title: "React Hooks" },
          },
        ],
      ],
    }),
    attachments: z.array(z.unknown()).optional().openapi({
      description: "파일 첨부 (AI SDK v5 구조, 선택적)",
    }),
    createdAt: z.string().openapi({
      description: "생성 시간 (ISO 8601)",
      examples: ["2025-11-13T10:00:00.000Z"],
    }),
  })
  .openapi("Message");

/**
 * 대화 세션 스키마 (OpenAPI 메타데이터 추가)
 */
export const ConversationSchema = conversationSchema
  .extend({
    id: z.string().openapi({
      description: "대화 세션 고유 ID",
      examples: ["conv_1234567890"],
    }),
    learningPlanId: z.string().openapi({
      description: "학습 계획 Public ID",
      examples: ["plan_abc123"],
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
    learningPlanId: z.string().openapi({
      description: "학습 계획 Public ID (conversationId가 없을 때 필수)",
      examples: ["plan_abc123"],
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
    learningPlanId: z.string().openapi({
      description: "학습 계획 Public ID",
      examples: ["plan_abc123"],
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
 * 대화 상세 조회 응답 스키마 (대화 정보 + 메시지 목록)
 */
export const ConversationDetailResponseSchema = z
  .object({
    conversation: ConversationSchema.openapi({
      description: "대화 세션 정보",
    }),
    messages: z.array(MessageSchema).openapi({
      description: "메시지 목록 (시간순 정렬)",
    }),
    totalMessageCount: z
      .number()
      .int()
      .openapi({
        description: "전체 메시지 개수",
        examples: [15],
      }),
  })
  .openapi("ConversationDetailResponse");

/**
 * 공통 에러 응답
 */
export { ErrorResponseSchema };
