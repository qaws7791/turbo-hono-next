import { z } from "zod";

import type { InferUITools, UIMessage } from "ai";
import type { AppToolSet } from "./tool-definitions";
import type { UIDataTypes } from "./data-parts";
import type { MessageMetadata } from "./metadata";

/**
 * 메시지 역할
 */
export type MessageRole = "user" | "assistant" | "tool" | "system";

/**
 * 타입 추론된 Tools
 * AI SDK의 InferUITools를 사용하여 AppToolSet에서 타입 자동 추론
 */
export type InferredAppTools = InferUITools<AppToolSet>;

/**
 * 프로젝트의 표준 UIMessage 타입
 * - AI SDK v5의 UIMessage를 기반으로 함
 * - 메타데이터: MessageMetadata - 메시지 추가 정보 (conversationId, learningPlanId 등)
 * - 커스텀 데이터: UIDataTypes - UI 렌더링용 데이터 (진행 상태, 알림 등)
 * - Tools 타입: InferredAppTools - AI SDK v5의 타입 추론 활용
 *
 * @remarks
 * AI SDK v5의 InferUITools를 사용하여 100% 타입 세이프한 tool 호출 구현
 * - toolName: 자동완성 지원 ('createModule' | 'updateModule' | ...)
 * - args: tool별 input 타입 자동 추론
 * - result: tool별 output 타입 자동 추론
 */
export type AppUIMessage = UIMessage<
  MessageMetadata,
  UIDataTypes,
  InferredAppTools
>;

/**
 * 데이터베이스 저장용 메시지 스키마
 *
 * @remarks
 * AI SDK v5의 메시지 구조 사용:
 * - parts: 모든 메시지 내용 (text, tool, file 등)
 * - attachments: 파일 첨부 (선택적)
 */
export const storedMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "tool", "system"]),
  parts: z.array(z.unknown()),
  attachments: z.array(z.unknown()).optional(),
  createdAt: z.string(),
});

/**
 * 데이터베이스 저장용 메시지 타입
 */
export type StoredMessage = z.infer<typeof storedMessageSchema>;

/**
 * API 응답용 메시지 타입
 *
 * @remarks
 * AI SDK v5의 메시지 구조 사용:
 * - parts: 모든 메시지 내용 (text, tool 호출/결과, file 등)
 * - attachments: 파일 첨부 (선택적)
 */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  parts: Array<unknown>;
  attachments?: Array<unknown>;
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

/**
 * ============================================================
 * Tool Invocation Types (타입 안전한 tool 호출)
 * ============================================================
 */

/**
 * 타입 안전한 Tool Part
 * AppUIMessage의 parts 배열에서 tool 타입만 추출
 *
 * @remarks
 * AI SDK v5의 UIMessage는 parts 배열에 다양한 타입의 part를 포함:
 * - TextUIPart: 텍스트 컨텐츠
 * - ToolUIPart: Tool 호출 및 결과
 * - ReasoningUIPart: AI의 추론 과정
 * - etc.
 *
 * Tool part는 type이 'tool-${toolName}' 형태로 지정됨
 */
export type AppToolPart = Extract<
  AppUIMessage["parts"][number],
  { type: `tool-${string}` }
>;

/**
 * 타입 안전한 Tool Call (입력 사용 가능 상태)
 * Tool이 호출되고 입력이 준비된 상태
 */
export type AppToolCallInputAvailable = Extract<
  AppToolPart,
  { state: "input-available" }
>;

/**
 * 타입 안전한 Tool Result (출력 사용 가능 상태)
 * Tool 실행이 완료되고 결과가 있는 상태
 */
export type AppToolResultOutputAvailable = Extract<
  AppToolPart,
  { state: "output-available" }
>;

/**
 * 타입 안전한 Tool Error
 * Tool 실행 중 에러가 발생한 상태
 */
export type AppToolResultOutputError = Extract<
  AppToolPart,
  { state: "output-error" }
>;
