import type { CreatePlanBody } from "../domain";

export function buildCreatePlanBody(input: {
  materialIds: Array<string>;
  goalType: CreatePlanBody["goalType"];
  currentLevel: CreatePlanBody["currentLevel"];
  targetDueDate: string;
  specialRequirements: string;
}): CreatePlanBody {
  const specialRequirements = input.specialRequirements.trim();

  const body: CreatePlanBody = {
    materialIds: input.materialIds,
    goalType: input.goalType,
    currentLevel: input.currentLevel,
    targetDueDate: input.targetDueDate,
  };

  if (specialRequirements.length > 0) {
    body.specialRequirements = specialRequirements;
  }

  return body;
}
