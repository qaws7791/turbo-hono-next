import type { PlanWizardMaterial } from "./wizard-types";

/**
 * 자료가 선택 가능한 상태인지 확인
 * @param material 자료 정보
 * @returns 분석 완료된 자료만 선택 가능
 */
export function canSelectMaterial(material: PlanWizardMaterial): boolean {
  return material.status === "completed";
}

/**
 * 자료 상태에 따른 Badge variant 반환
 */
export function materialStatusBadgeVariant(
  status: PlanWizardMaterial["status"],
): "secondary" | "destructive" | "outline" {
  if (status === "completed") return "secondary";
  if (status === "error") return "destructive";
  return "outline";
}
