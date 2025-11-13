/**
 * AI 채팅 관련 타입 정의
 */

/**
 * 메시지 역할
 */
export type MessageRole = "user" | "assistant" | "tool";

/**
 * Tool 호출 정보
 */
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  providerExecuted?: boolean;
  error?: unknown;
}

/**
 * 메시지
 */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  toolInvocations?: Array<ToolInvocation>;
  createdAt: string;
}

/**
 * 대화 세션
 */
export interface Conversation {
  id: string;
  learningPlanId: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}
