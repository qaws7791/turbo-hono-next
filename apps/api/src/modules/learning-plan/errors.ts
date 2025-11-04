import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "../../errors/error-codes";
import type { ErrorDetails } from "../../errors/base.error";

/**
 * Learning plan specific error class.
 * Uses standardized error codes from error-codes.ts
 */
export class LearningPlanError extends BaseError {
  constructor(
    statusCode: ContentfulStatusCode,
    code: ErrorCode,
    message?: string,
    details?: ErrorDetails,
  ) {
    super(statusCode, code, message || `Learning plan error: ${code}`, details);
  }
}

/**
 * Factory functions for common learning plan errors
 */
export const LearningPlanErrors = {
  notFound: (details?: ErrorDetails) =>
    new LearningPlanError(
      404,
      ErrorCodes.NOT_FOUND_LEARNING_PLAN,
      "Learning plan not found",
      details,
    ),

  accessDenied: (details?: ErrorDetails) =>
    new LearningPlanError(
      403,
      ErrorCodes.LEARNING_PLAN_ACCESS_DENIED,
      "Access denied to learning plan",
      details,
    ),

  creationFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_CREATION_FAILED,
      "Failed to create learning plan",
      details,
    ),

  updateFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_UPDATE_FAILED,
      "Failed to update learning plan",
      details,
    ),

  deleteFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_DELETE_FAILED,
      "Failed to delete learning plan",
      details,
    ),

  invalidStatus: (details?: ErrorDetails) =>
    new LearningPlanError(
      400,
      ErrorCodes.LEARNING_PLAN_INVALID_STATUS,
      "Invalid learning plan status",
      details,
    ),

  moduleNotFound: (details?: ErrorDetails) =>
    new LearningPlanError(
      404,
      ErrorCodes.NOT_FOUND_LEARNING_MODULE,
      "Learning module not found",
      details,
    ),

  moduleCreationFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_MODULE_CREATION_FAILED,
      "Failed to create learning module",
      details,
    ),

  taskNotFound: (details?: ErrorDetails) =>
    new LearningPlanError(
      404,
      ErrorCodes.NOT_FOUND_LEARNING_TASK,
      "Learning task not found",
      details,
    ),

  taskCreationFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_TASK_CREATION_FAILED,
      "Failed to create learning task",
      details,
    ),

  taskUpdateFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_TASK_UPDATE_FAILED,
      "Failed to update learning task",
      details,
    ),

  taskMoveFailed: (details?: ErrorDetails) =>
    new LearningPlanError(
      500,
      ErrorCodes.LEARNING_PLAN_TASK_MOVE_FAILED,
      "Failed to move learning task",
      details,
    ),
};
