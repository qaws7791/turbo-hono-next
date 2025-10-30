import { BaseError } from "../../errors/base.error";

import type { ContentfulStatusCode } from "hono/utils/http-status";

export type LearningPlanErrorType =
  | "learning_plan_not_found"
  | "access_denied"
  | "invalid_pagination_cursor"
  | "invalid_filter_params"
  | "validation_failed"
  | "creation_failed"
  | "update_failed"
  | "deletion_failed"
  | "status_change_failed"
  | "invalid_learning_plan_id"
  | "learning_plan_already_archived"
  | "cannot_delete_active_learning_plan"
  | "learning_module_not_found"
  | "learning_module_access_denied"
  | "learning_module_validation_failed"
  | "learning_module_creation_failed"
  | "learning_module_update_failed"
  | "learning_module_deletion_failed"
  | "learning_module_reorder_failed"
  | "invalid_learning_module_id"
  | "invalid_learning_module_order"
  | "learning_module_order_out_of_range"
  | "internal_error"
  | "learning_task_creation_failed"
  | "learning_task_validation_failed"
  | "learning_task_not_found"
  | "learning_task_deletion_failed"
  | "learning_task_reorder_failed"
  | "target_learning_module_not_found"
  | "learning_task_update_failed";

export type LearningPlanErrorCode = `learning_plan:${LearningPlanErrorType}`;

export class LearningPlanError extends BaseError {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: LearningPlanErrorCode,
    public readonly message: string,
  ) {
    super(statusCode, code, message);
  }
}
