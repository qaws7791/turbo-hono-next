/**
 * AI 메시지 처리 유틸리티 함수
 */

import type { ToolName } from "@repo/ai-types";

/**
 * Tool part 상태 타입
 */
export type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

/**
 * Tool part 타입 (AI SDK v5 기반)
 */
export interface ToolPart {
  type: `tool-${string}`;
  toolCallId: string;
  state: ToolPartState;
  toolName: string;
  input?: unknown;
  result?: unknown;
  errorText?: string;
}

/**
 * Text part 타입 가드
 */
function isTextPart(part: unknown): part is { type: "text"; text: string } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === "text" &&
    "text" in part &&
    typeof part.text === "string"
  );
}

/**
 * Tool part 타입 가드
 */
export function isToolPart(part: unknown): part is ToolPart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    typeof part.type === "string" &&
    part.type.startsWith("tool-") &&
    "toolCallId" in part &&
    "state" in part
  );
}

/**
 * Tool name을 part.type에서 추출
 * @example "tool-createModule" -> "createModule"
 */
export function extractToolName(toolType: string): string {
  return toolType.replace(/^tool-/, "");
}

/**
 * 특정 tool name을 가진 part인지 확인
 */
export function isSpecificTool<T extends ToolName>(
  part: unknown,
  toolName: T,
): part is ToolPart & { toolName: T } {
  if (!isToolPart(part)) return false;
  const extractedName = extractToolName(part.type);
  return extractedName === toolName;
}

/**
 * Tool invocation 표시용 타입
 */
export interface ToolInvocationDisplay {
  toolCallId: string;
  toolName: string;
  arguments: unknown;
  result?: unknown;
  state: "call" | "result";
}

/**
 * parts 배열에서 텍스트 내용을 추출합니다
 */
export function extractTextFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) {
    return "";
  }

  const textParts = parts.filter(isTextPart);
  return textParts.map((part) => part.text).join("\n");
}

/**
 * parts 배열에서 tool invocation들을 추출하여 표시용 형식으로 변환합니다
 */
export function extractToolInvocationsFromParts(
  parts: unknown,
): Array<ToolInvocationDisplay> {
  if (!Array.isArray(parts)) {
    return [];
  }

  const toolParts = parts.filter(isToolPart);

  return toolParts.map((part) => {
    // type이 "tool-createModule" 형식이므로 "tool-" 접두사 제거
    const toolName = part.type.replace(/^tool-/, "");

    return {
      toolCallId: part.toolCallId,
      toolName,
      arguments: part.input,
      result: part.result,
      state: part.result !== undefined ? "result" : "call",
    } satisfies ToolInvocationDisplay;
  });
}
