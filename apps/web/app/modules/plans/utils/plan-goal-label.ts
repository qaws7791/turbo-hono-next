import type { PlanListItem } from "~/modules/plans";

export function getPlanGoalLabel(goalType: PlanListItem["goalType"]): string {
  const labels: Record<PlanListItem["goalType"], string> = {
    JOB: "취업/이직",
    CERT: "자격증",
    WORK: "업무 활용",
    HOBBY: "자기계발/취미",
    OTHER: "기타",
  };
  return labels[goalType];
}
