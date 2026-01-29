export type AiError = {
  readonly _tag: "AiError";
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
};

export function aiError(params: {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
}): AiError {
  return { _tag: "AiError", ...params };
}

export function isAiError(value: unknown): value is AiError {
  if (!value || typeof value !== "object") return false;
  return "_tag" in value && (value as { _tag?: unknown })._tag === "AiError";
}

export function toAiError(cause: unknown): AiError {
  if (isAiError(cause)) return cause;
  if (cause instanceof Error) {
    return aiError({
      code: "AI_UNKNOWN_ERROR",
      message: cause.message || "AI 요청 중 알 수 없는 오류가 발생했습니다.",
      cause,
    });
  }
  return aiError({
    code: "AI_UNKNOWN_ERROR",
    message: "AI 요청 중 알 수 없는 오류가 발생했습니다.",
    cause,
  });
}
