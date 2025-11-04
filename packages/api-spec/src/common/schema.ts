import { z } from "@hono/zod-openapi";

/**
 * Common error response schema used across all API endpoints.
 * Provides a standardized error structure with code and message.
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      description: "Error code",
      example: "VALIDATION_ERROR",
    }),
    message: z.string().openapi({
      description: "Error message",
      example: "Invalid request data",
    }),
  }),
});

/**
 * Type-safe error response type
 */
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
