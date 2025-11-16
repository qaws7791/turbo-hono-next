/**
 * AI 채팅 관련 타입 정의
 * @repo/ai-types의 공통 타입을 재export
 */

// Re-export types from @repo/ai-types
export type { MessageRole, Message, Conversation } from "@repo/ai-types";

// Export utility types and functions
export type { ToolInvocationDisplay } from "./utils";
export { extractTextFromParts, extractToolInvocationsFromParts } from "./utils";

/**
 * ToolInvocation 타입 (UI 표시용)
 * @deprecated StoredToolInvocation이 deprecated되어 ToolInvocationDisplay로 대체
 */
export type { ToolInvocationDisplay as ToolInvocation } from "./utils";
