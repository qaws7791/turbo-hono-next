import { z } from "zod";

import { storedToolInvocationSchema } from "./tools";

import type { UIMessage } from "ai";
import type { UIDataTypes } from "./data-parts";
import type { MessageMetadata } from "./metadata";
import type { StoredToolInvocation } from "./tools";

/**
 * 메시지 역할
 */
export type MessageRole = "user" | "assistant" | "tool" | "system";

/**
 * 프로젝트의 표준 UIMessage 타입
 * - AI SDK v5의 UIMessage를 기반으로 함
 * - 메타데이터: MessageMetadata - 메시지 추가 정보 (conversationId, learningPlanId 등)
 * - 커스텀 데이터: UIDataTypes - UI 렌더링용 데이터 (진행 상태, 알림 등)
 * - Tools 타입: never - 런타임에 AI SDK가 자동으로 도구 타입 추론
 *
 * @remarks
 * Tools 타입을 never로 설정한 이유:
 * - AI SDK v5는 런타임에 제공된 도구로부터 타입을 자동 추론
 * - 프로젝트의 모든 AI 도구는 @repo/ai-types 패키지의 AllTools 타입으로 정의됨
 * - 명시적 타입 대신 런타임 추론을 사용하여 유연성 확보
 */
export type AppUIMessage = UIMessage<MessageMetadata, UIDataTypes, never>;

/**
 * 데이터베이스 저장용 메시지 스키마
 */
export const storedMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "tool", "system"]),
  content: z.string(),
  toolInvocations: z.array(storedToolInvocationSchema).optional(),
  createdAt: z.string(),
});

/**
 * 데이터베이스 저장용 메시지 타입
 */
export type StoredMessage = z.infer<typeof storedMessageSchema>;

/**
 * API 응답용 메시지 타입 (StoredMessage와 동일하지만 명시적으로 정의)
 */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  toolInvocations?: Array<StoredToolInvocation>;
  createdAt: string;
}

/**
 * 대화 세션 스키마
 */
export const conversationSchema = z.object({
  id: z.string(),
  learningPlanId: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * 대화 세션 타입
 */
export type Conversation = z.infer<typeof conversationSchema>;
