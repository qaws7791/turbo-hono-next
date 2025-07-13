import type { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { BaseError } from "./base.error";

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: ContentfulStatusCode;
}

export function createErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof BaseError) {
    return {
      error: error.name,
      message: error.message,
      statusCode: error.statusCode as ContentfulStatusCode,
    };
  }

  // Handle validation errors from Zod/OpenAPI
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "ZodError") {
      return {
        error: "VALIDATION_ERROR",
        message: "Invalid request data",
        statusCode: 400,
      };
    }
  }

  // Unknown error - log for debugging but don't expose details
  console.error("Unknown error:", error);

  return {
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}

export function handleError(error: unknown, c: Context) {
  const errorResponse = createErrorResponse(error);
  return c.json(errorResponse, errorResponse.statusCode);
}
