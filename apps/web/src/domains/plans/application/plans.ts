import { createPlan, getPlan, listSpacePlans } from "../api";
import { mapCurrentLevelToApi, mapGoalTypeToApi } from "../api/plans.mapper";

import type { PlanGoal, PlanLevel, PlanWithDerived } from "../model/types";

export async function listPlansForUi(
  spaceId: string,
): Promise<Array<PlanWithDerived>> {
  const { data } = await listSpacePlans(spaceId);
  return data;
}

export async function getPlanForUi(planId: string): Promise<PlanWithDerived> {
  return getPlan(planId);
}

export async function getActivePlanForSpaceUi(
  spaceId: string,
): Promise<PlanWithDerived | null> {
  const { data } = await listSpacePlans(spaceId, {
    status: "ACTIVE",
    limit: 1,
  });
  return data[0] ?? null;
}

function computeTargetDueDate(input: {
  durationMode: "custom" | "adaptive";
  durationValue?: number;
  durationUnit?: "days" | "weeks" | "months";
}): string {
  const base = new Date();
  if (input.durationMode !== "custom") {
    base.setDate(base.getDate() + 30);
    return base.toISOString().slice(0, 10);
  }

  const rawValue = input.durationValue ?? 30;
  const value = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 30;
  const unit = input.durationUnit ?? "days";
  const days =
    unit === "months" ? value * 30 : unit === "weeks" ? value * 7 : value;
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export async function createPlanForUi(
  spaceId: string,
  input: {
    sourceMaterialIds: Array<string>;
    goal: PlanGoal;
    level: PlanLevel;
    durationMode: "custom" | "adaptive";
    durationValue?: number;
    durationUnit?: "days" | "weeks" | "months";
    notes?: string;
  },
): Promise<{ id: string }> {
  const targetDueDate = computeTargetDueDate(input);

  const plan = await createPlan(spaceId, {
    materialIds: input.sourceMaterialIds,
    goalType: mapGoalTypeToApi(input.goal),
    currentLevel: mapCurrentLevelToApi(input.level),
    targetDueDate,
    specialRequirements: input.notes,
  });

  return { id: plan.id };
}
