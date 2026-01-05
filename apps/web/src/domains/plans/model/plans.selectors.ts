import type { PlanGoal, PlanLevel } from "./types";

export function getPlanGoalLabel(goal: PlanGoal): string {
  const labels: Record<PlanGoal, string> = {
    career: "취업/이직",
    certificate: "자격증",
    work: "업무 활용",
    hobby: "자기계발/취미",
  };
  return labels[goal];
}

export function getPlanLevelLabel(level: PlanLevel): string {
  const labels: Record<PlanLevel, string> = {
    novice: "입문",
    basic: "초급",
    intermediate: "중급",
    advanced: "고급",
  };
  return labels[level];
}
