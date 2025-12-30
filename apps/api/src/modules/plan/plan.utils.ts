import type { PlanGoalType, PlanStatus } from "./plan.dto";

export function parseDateOnly(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map((value) => Number(value));
  if (!year || !month || !day) return new Date(isoDate);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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
