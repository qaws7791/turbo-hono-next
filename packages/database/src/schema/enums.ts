import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "DISABLED"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "FREE",
  "PRO",
]);
export const authProviderEnum = pgEnum("auth_provider", ["GOOGLE"]);

export const materialSourceTypeEnum = pgEnum("material_source_type", [
  "FILE",
  "TEXT",
]);
export const storageProviderEnum = pgEnum("storage_provider", ["R2"]);
export const materialProcessingStatusEnum = pgEnum(
  "material_processing_status",
  ["PENDING", "PROCESSING", "READY", "FAILED"],
);

export const materialUploadStatusEnum = pgEnum("material_upload_status", [
  "INITIATED",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
]);

export const materialJobTypeEnum = pgEnum("material_job_type", [
  "TEXT_EXTRACT",
  "OUTLINE",
  "CHUNK",
  "EMBED",
]);
export const materialJobStatusEnum = pgEnum("material_job_status", [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export const outlineNodeTypeEnum = pgEnum("outline_node_type", [
  "SECTION",
  "TOPIC",
]);

export const planGenerationRequestStatusEnum = pgEnum(
  "plan_generation_request_status",
  ["DRAFT", "SUBMITTED", "GENERATING", "SUCCEEDED", "FAILED", "CANCELED"],
);
export const planGoalTypeEnum = pgEnum("plan_goal_type", [
  "JOB",
  "CERT",
  "WORK",
  "HOBBY",
  "OTHER",
]);
export const planCurrentLevelEnum = pgEnum("plan_current_level", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);
export const planStatusEnum = pgEnum("plan_status", [
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
  "COMPLETED",
]);

export const planSessionTypeEnum = pgEnum("plan_session_type", ["LEARN"]);
export const planSessionStatusEnum = pgEnum("plan_session_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELED",
]);

export const sessionRunStatusEnum = pgEnum("session_run_status", [
  "RUNNING",
  "COMPLETED",
  "ABANDONED",
]);
export const sessionExitReasonEnum = pgEnum("session_exit_reason", [
  "USER_EXIT",
  "NETWORK",
  "ERROR",
  "TIMEOUT",
]);
export const sessionCheckinKindEnum = pgEnum("session_checkin_kind", [
  "QUESTION",
  "SELF_ASSESSMENT",
  "BEHAVIOR_SIGNAL",
]);
export const sessionActivityKindEnum = pgEnum("session_activity_kind", [
  "EXERCISE",
  "MCQ",
  "FREEFORM",
  "CODE",
]);

export const chatScopeTypeEnum = pgEnum("chat_scope_type", ["PLAN", "SESSION"]);
export const chatMessageRoleEnum = pgEnum("chat_message_role", [
  "USER",
  "ASSISTANT",
  "SYSTEM",
]);
