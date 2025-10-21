import { BaseError } from "../../errors/base.error";

import type { ContentfulStatusCode } from "hono/utils/http-status";


export type RoadmapErrorType =
  | "roadmap_not_found"
  | "access_denied"
  | "invalid_pagination_cursor"
  | "invalid_filter_params"
  | "validation_failed"
  | "creation_failed"
  | "update_failed"
  | "deletion_failed"
  | "status_change_failed"
  | "invalid_roadmap_id"
  | "roadmap_already_archived"
  | "cannot_delete_active_roadmap"
  | "goal_not_found"
  | "goal_access_denied"
  | "goal_validation_failed"
  | "goal_creation_failed"
  | "goal_update_failed"
  | "goal_deletion_failed"
  | "goal_reorder_failed"
  | "invalid_goal_id"
  | "invalid_goal_order"
  | "goal_order_out_of_range"
  | "internal_error"
  | "sub_goal_creation_failed"
  | "sub_goal_validation_failed"
  | "sub_goal_not_found"
  | "sub_goal_deletion_failed"
  | "sub_goal_reorder_failed"
  | "target_goal_not_found"
  | "sub_goal_update_failed";

export type RoadmapErrorCode = `roadmap:${RoadmapErrorType}`;

export class RoadmapError extends BaseError {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: RoadmapErrorCode,
    public readonly message: string,
  ) {
    super(statusCode, code, message);
  }
}
