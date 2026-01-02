import type { CreatePlanBody } from "./types";

export const MAX_PLAN_MATERIALS = 5;

export const planGoalOptions: Array<{
  value: CreatePlanBody["goalType"];
  label: string;
}> = [
  { value: "JOB", label: "취업/이직" },
  { value: "CERT", label: "자격증 취득" },
  { value: "WORK", label: "업무 적용" },
  { value: "HOBBY", label: "취미/교양" },
  { value: "OTHER", label: "기타" },
];

export const planLevelOptions: Array<{
  value: CreatePlanBody["currentLevel"];
  label: string;
}> = [
  { value: "BEGINNER", label: "초급" },
  { value: "INTERMEDIATE", label: "중급" },
  { value: "ADVANCED", label: "고급" },
];

export function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
