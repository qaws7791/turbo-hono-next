export type PlanStatus = "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED";

export type PlanGenerationStatus =
  | "PENDING"
  | "GENERATING"
  | "READY"
  | "FAILED";

export type PlanSessionType = "LEARN";

export type PlanSessionStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELED";

export function validateStatusTransition(
  from: PlanStatus,
  to: PlanStatus,
): boolean {
  if (from === to) return true;
  if (from === "ACTIVE") return to === "PAUSED" || to === "ARCHIVED";
  if (from === "PAUSED") return to === "ACTIVE" || to === "ARCHIVED";
  return false;
}
