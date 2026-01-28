export type CoreError = {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
};

export function coreError(input: {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
}): CoreError {
  return {
    code: input.code,
    message: input.message,
    details: input.details,
    cause: input.cause,
  };
}

export function isCoreError(value: unknown): value is CoreError {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<CoreError>;
  return typeof v.code === "string" && typeof v.message === "string";
}
