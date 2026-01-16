import type { PlanGoalType, PlanStatus } from "./plan.dto";

export function buildPlanTitle(
  goalType: PlanGoalType,
  spaceName: string,
): string {
  const goal =
    goalType === "WORK"
      ? "업무"
      : goalType === "JOB"
        ? "취업"
        : goalType === "CERT"
          ? "자격증"
          : goalType === "HOBBY"
            ? "취미"
            : "학습";

  return `${spaceName} - ${goal} 학습 계획`;
}

export function validateStatusTransition(
  from: PlanStatus,
  to: PlanStatus,
): boolean {
  if (from === to) return true;
  if (from === "ACTIVE") return to === "PAUSED" || to === "ARCHIVED";
  if (from === "PAUSED") return to === "ACTIVE" || to === "ARCHIVED";
  return false;
}
