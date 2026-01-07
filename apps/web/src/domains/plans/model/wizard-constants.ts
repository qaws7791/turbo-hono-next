import type { PlanGoal, PlanLevel } from "./types";

/**
 * 최소 자료 선택 개수
 */
export const MIN_MATERIAL_COUNT = 1;

/**
 * 최대 자료 선택 개수
 */
export const MAX_MATERIAL_COUNT = 5;

/**
 * 학습 목표 옵션 목록
 */
export const GOAL_OPTIONS: Array<{ value: PlanGoal; label: string }> = [
  { value: "career", label: "취업/이직" },
  { value: "certificate", label: "자격증 취득" },
  { value: "work", label: "업무 적용" },
  { value: "hobby", label: "취미/교양" },
];

/**
 * 현재 수준 옵션 목록
 */
export const LEVEL_OPTIONS: Array<{ value: PlanLevel; label: string }> = [
  { value: "novice", label: "완전 초보" },
  { value: "basic", label: "기초" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
];
