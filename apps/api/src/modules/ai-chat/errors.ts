import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "../../errors/error-codes";
import type { ErrorDetails } from "../../errors/base.error";

/**
 * AI Chat specific error class.
 * Uses standardized error codes from error-codes.ts
 */
export class AIChatError extends BaseError {
  constructor(
    statusCode: ContentfulStatusCode,
    code: ErrorCode,
    message?: string,
    details?: ErrorDetails,
  ) {
    super(statusCode, code, message || `AI Chat error: ${code}`, details);
  }
}

/**
 * Factory functions for common AI chat errors
 */
export const AIChatErrors = {
  conversationNotFound: (details?: ErrorDetails) =>
    new AIChatError(
      404,
      ErrorCodes.NOT_FOUND_CONVERSATION,
      "Conversation not found",
      details,
    ),

  messageCreationFailed: (details?: ErrorDetails) =>
    new AIChatError(
      500,
      ErrorCodes.AI_GENERATION_FAILED,
      "Failed to create message",
      details,
    ),

  streamingFailed: (details?: ErrorDetails) =>
    new AIChatError(
      500,
      ErrorCodes.AI_GENERATION_FAILED,
      "Failed to stream message",
      details,
    ),

  learningPlanNotFound: (details?: ErrorDetails) =>
    new AIChatError(
      404,
      ErrorCodes.NOT_FOUND_LEARNING_PLAN,
      "Learning plan not found",
      details,
    ),
};
