import type { PlanStatus } from "./plan.dto";

export function validateStatusTransition(
  from: PlanStatus,
  to: PlanStatus,
): boolean {
  if (from === to) return true;
  if (from === "ACTIVE") return to === "PAUSED" || to === "ARCHIVED";
  if (from === "PAUSED") return to === "ACTIVE" || to === "ARCHIVED";
  return false;
}
