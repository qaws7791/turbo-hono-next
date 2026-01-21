export type PlanWizardStep = 1 | 2;

export type PlanWizardMaterial = {
  id: string;
  title: string;
  summary?: string;
  kind: "file" | "url" | "text";
  status: "pending" | "analyzing" | "completed" | "error";
};

export type PlanWizardValues = {
  selectedMaterialIds: Array<string>;
  search: string;
  durationMode: "custom" | "adaptive";
  durationValue: string;
  durationUnit: "days" | "weeks" | "months";
  notes: string;
};

export type PlanWizardDerived = {
  filteredMaterials: Array<PlanWizardMaterial>;
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
  setDurationMode: (value: "custom" | "adaptive") => void;
  setDurationValue: (value: string) => void;
  setDurationUnit: (value: "days" | "weeks" | "months") => void;
  setNotes: (value: string) => void;
  goNext: () => void;
  goBack: () => void;
  submit: () => void;
};
