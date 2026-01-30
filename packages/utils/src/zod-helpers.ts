import * as neverthrow from "neverthrow";

import type * as z from "zod";

const { err, ok } = neverthrow;

export interface ParseError {
  readonly _tag: "ParseError";
  readonly schemaName: string;
  readonly issues: Array<z.ZodIssue>;
}

export function parseError(
  schemaName: string,
  issues: Array<z.ZodIssue>,
): ParseError {
  return {
    _tag: "ParseError",
    schemaName,
    issues,
  };
}

export function isParseError(value: unknown): value is ParseError {
  return (
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    value._tag === "ParseError"
  );
}

export function parseOrError<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
  schemaName: string,
): neverthrow.Result<z.infer<TSchema>, ParseError> {
  const parsed = schema.safeParse(data);
  if (parsed.success) return ok(parsed.data);

  return err(parseError(schemaName, parsed.error.issues));
}

export function safeParse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): neverthrow.Result<z.infer<TSchema>, ParseError> {
  return parseOrError(schema, data, "schema");
}
