import type { MaterialListItem } from "~/modules/materials";

export type PlanStatus = "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED";

export type PlanGoalType = "JOB" | "CERT" | "WORK" | "HOBBY" | "OTHER";

export type PlanCurrentLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type PlanListItem = {
  id: string;
  title: string;
  status: PlanStatus;
  goalType: PlanGoalType;
  progress: { completedSessions: number; totalSessions: number };
};

export type PlansListMeta = {
  total: number;
  page: number;
  limit: number;
};

export type SpacePlansResponse = {
  data: Array<PlanListItem>;
  meta: PlansListMeta;
};

export type CreatePlanBody = {
  materialIds: Array<string>;
  goalType: PlanGoalType;
  currentLevel: PlanCurrentLevel;
  targetDueDate: string;
  specialRequirements?: string;
};

export type CreatePlanResponse = {
  data: {
    id: string;
    title: string;
    status: PlanStatus;
  };
};

export type PlanDetail = {
  id: string;
  spaceId: string;
  title: string;
  status: PlanStatus;
  goalType: PlanGoalType;
  currentLevel: PlanCurrentLevel;
  targetDueDate: string;
  specialRequirements: string | null;
};

export type PlanDetailResponse = {
  data: PlanDetail;
};

export type PlanStatusBody = {
  status: PlanStatus;
};

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
