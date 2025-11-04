import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "../../errors/error-codes";
import type { ErrorDetails } from "../../errors/base.error";

/**
 * AI specific error class.
 * Uses standardized error codes from error-codes.ts
 */
export class AIError extends BaseError {
  constructor(
    statusCode: ContentfulStatusCode,
    code: ErrorCode,
    message?: string,
    details?: ErrorDetails,
  ) {
    super(statusCode, code, message || `AI error: ${code}`, details);
  }
}

/**
 * Factory functions for common AI errors
 */
export const AIErrors = {
  generationFailed: (details?: ErrorDetails) =>
    new AIError(
      500,
      ErrorCodes.AI_GENERATION_FAILED,
      "AI generation failed",
      details,
    ),

  apiLimitExceeded: (details?: ErrorDetails) =>
    new AIError(
      429,
      ErrorCodes.AI_API_LIMIT_EXCEEDED,
      "AI API rate limit exceeded",
      details,
    ),

  apiUnavailable: (details?: ErrorDetails) =>
    new AIError(
      503,
      ErrorCodes.AI_API_UNAVAILABLE,
      "AI service is temporarily unavailable",
      details,
    ),

  invalidPrompt: (details?: ErrorDetails) =>
    new AIError(
      400,
      ErrorCodes.AI_INVALID_PROMPT,
      "Invalid AI prompt",
      details,
    ),

  timeout: (details?: ErrorDetails) =>
    new AIError(504, ErrorCodes.AI_TIMEOUT, "AI generation timed out", details),

  noteGenerationFailed: (details?: ErrorDetails) =>
    new AIError(
      500,
      ErrorCodes.AI_NOTE_GENERATION_FAILED,
      "Failed to generate AI note",
      details,
    ),

  quizGenerationFailed: (details?: ErrorDetails) =>
    new AIError(
      500,
      ErrorCodes.AI_QUIZ_GENERATION_FAILED,
      "Failed to generate AI quiz",
      details,
    ),

  learningPlanNotFound: (details?: ErrorDetails) =>
    new AIError(
      404,
      ErrorCodes.NOT_FOUND_LEARNING_PLAN,
      "Learning plan not found",
      details,
    ),

  learningTaskNotFound: (details?: ErrorDetails) =>
    new AIError(
      404,
      ErrorCodes.NOT_FOUND_LEARNING_TASK,
      "Learning task not found",
      details,
    ),

  documentNotFound: (details?: ErrorDetails) =>
    new AIError(
      404,
      ErrorCodes.NOT_FOUND_DOCUMENT,
      "Document not found",
      details,
    ),

  accessDenied: (details?: ErrorDetails) =>
    new AIError(403, ErrorCodes.AUTH_FORBIDDEN, "Access denied", details),

  databaseError: (details?: ErrorDetails) =>
    new AIError(
      500,
      ErrorCodes.INTERNAL_DATABASE_ERROR,
      "Database error occurred",
      details,
    ),

  transactionFailed: (details?: ErrorDetails) =>
    new AIError(
      500,
      ErrorCodes.INTERNAL_TRANSACTION_FAILED,
      "Transaction failed",
      details,
    ),
};
