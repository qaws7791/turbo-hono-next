import type { MaterialListItem } from "~/modules/materials";
import type { paths } from "~/types/api";

export type SpacePlansResponse =
  paths["/api/spaces/{spaceId}/plans"]["get"]["responses"][200]["content"]["application/json"];

export type PlanListItem = SpacePlansResponse["data"][number];
export type PlansListMeta = SpacePlansResponse["meta"];

export type CreatePlanBody = NonNullable<
  paths["/api/spaces/{spaceId}/plans"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreatePlanResponse =
  paths["/api/spaces/{spaceId}/plans"]["post"]["responses"][201]["content"]["application/json"];

export type PlanDetailResponse =
  paths["/api/plans/{planId}"]["get"]["responses"][200]["content"]["application/json"];

export type PlanDetail = PlanDetailResponse["data"];

export type PlanStatusBody = NonNullable<
  paths["/api/plans/{planId}/status"]["patch"]["requestBody"]
>["content"]["application/json"];

export type PlanStatus = PlanStatusBody["status"];

// Plan Wizard Types (from features)
export type PlanWizardStep = 1 | 2 | 3;

export type PlanWizardValues = {
  selectedMaterialIds: Array<string>;
  search: string;
  goalType: CreatePlanBody["goalType"];
  currentLevel: CreatePlanBody["currentLevel"];
  targetDueDate: string;
  specialRequirements: string;
};

export type PlanWizardDerived = {
  filteredMaterials: Array<MaterialListItem>;
  selectedCount: number;
  hasInvalidSelection: boolean;
};

export type PlanWizardModel = {
  step: PlanWizardStep;
  error: string | null;
  values: PlanWizardValues;
  derived: PlanWizardDerived;
  setSearch: (value: string) => void;
  toggleMaterial: (materialId: string) => void;
  setGoalType: (value: CreatePlanBody["goalType"]) => void;
  setCurrentLevel: (value: CreatePlanBody["currentLevel"]) => void;
  setTargetDueDate: (value: string) => void;
  setSpecialRequirements: (value: string) => void;
  goNext: () => void;
  goBack: () => void;
  submit: () => void;
};
