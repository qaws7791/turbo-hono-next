import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "DISABLED"]);
export const authProviderEnum = pgEnum("auth_provider", ["GOOGLE"]);
export const tagSourceEnum = pgEnum("tag_source", ["AI", "USER"]);

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
  "TAG",
  "CONCEPT_CANDIDATE",
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

export const planSessionTypeEnum = pgEnum("plan_session_type", [
  "LEARN",
  "REVIEW",
]);
export const planSessionStatusEnum = pgEnum("plan_session_status", [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELED",
]);

export const sessionConceptRoleEnum = pgEnum("session_concept_role", [
  "NEW",
  "REVIEW",
  "PREREQ",
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

export const conceptDifficultyEnum = pgEnum("concept_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
]);
export const conceptSessionLinkTypeEnum = pgEnum("concept_session_link_type", [
  "CREATED",
  "UPDATED",
  "REVIEWED",
]);
export const conceptRelationTypeEnum = pgEnum("concept_relation_type", [
  "RELATED",
  "PREREQUISITE",
  "SIMILAR",
  "CONTRAST",
]);
export const conceptReviewRatingEnum = pgEnum("concept_review_rating", [
  "AGAIN",
  "HARD",
  "GOOD",
  "EASY",
]);

export const chatScopeTypeEnum = pgEnum("chat_scope_type", [
  "SPACE",
  "PLAN",
  "SESSION",
  "CONCEPT",
]);
export const chatMessageRoleEnum = pgEnum("chat_message_role", [
  "USER",
  "ASSISTANT",
  "SYSTEM",
]);
