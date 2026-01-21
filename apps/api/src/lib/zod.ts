import * as neverthrow from "neverthrow";

import { ApiError } from "../middleware/error-handler";

import type * as z from "zod";

const { err, ok } = neverthrow;

export function parseOrInternalError<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
  schemaName: string,
): neverthrow.Result<z.infer<TSchema>, ApiError> {
  const parsed = schema.safeParse(data);
  if (parsed.success) return ok(parsed.data);

  return err(
    new ApiError(
      500,
      "INTERNAL_SCHEMA_MISMATCH",
      `${schemaName} 생성에 실패했습니다.`,
      { issuesCount: parsed.error.issues.length },
    ),
  );
}
