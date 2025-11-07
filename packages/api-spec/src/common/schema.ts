import { z } from "@hono/zod-openapi";

/**
 * Common error response schema used across all API endpoints.
 * Provides a standardized error structure with code and message.
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      description: "에러 코드",
      examples: ["VALIDATION_ERROR"],
    }),
    message: z.string().openapi({
      description: "에러 메시지",
      examples: ["요청 데이터가 유효하지 않습니다."],
    }),
  }),
});

/**
 * Type-safe error response type
 */
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
