import * as React from "react";

import { canSelectMaterial } from "../model";

import type {
  PlanGoal,
  PlanLevel,
  PlanWizardMaterial,
  PlanWizardModel,
  PlanWizardStep,
  PlanWizardValues,
} from "../model";
import type { CreatePlanInput } from "./use-create-plan-mutation";

function isPlanGoal(value: string): value is PlanGoal {
  return (
    value === "career" ||
    value === "certificate" ||
    value === "work" ||
    value === "hobby"
  );
}

function isPlanLevel(value: string): value is PlanLevel {
  return (
    value === "novice" ||
    value === "basic" ||
    value === "intermediate" ||
    value === "advanced"
  );
}

export function usePlanWizardForm(input: {
  materials: Array<PlanWizardMaterial>;
  submitPlan: (input: CreatePlanInput) => void;
}): PlanWizardModel {
  const [step, setStep] = React.useState<PlanWizardStep>(1);
  const [error, setError] = React.useState<string | null>(null);

  const [values, setValues] = React.useState<PlanWizardValues>({
    selectedMaterialIds: [],
    search: "",
    goal: "work",
    level: "basic",
    durationMode: "adaptive",
    durationValue: "",
    durationUnit: "weeks",
    notes: "",
  });

  const normalized = values.search.trim().toLowerCase();
  const filteredMaterials = React.useMemo(() => {
    return input.materials.filter((doc) => {
      if (!normalized) return true;
      const hay =
        `${doc.title} ${doc.summary ?? ""} ${doc.tags.join(" ")}`.toLowerCase();
      return hay.includes(normalized);
    });
  }, [input.materials, normalized]);

  const selectedCount = values.selectedMaterialIds.length;
  const hasInvalidSelection = values.selectedMaterialIds.some((id) => {
    const doc = input.materials.find((d) => d.id === id);
    return !doc || !canSelectMaterial(doc);
  });

  const setSearch = React.useCallback((value: string) => {
    setValues((prev) => ({ ...prev, search: value }));
  }, []);

  const toggleMaterial = React.useCallback((materialId: string) => {
    setValues((prev) => {
      if (prev.selectedMaterialIds.includes(materialId)) {
        return {
          ...prev,
          selectedMaterialIds: prev.selectedMaterialIds.filter(
            (id) => id !== materialId,
          ),
        };
      }
      if (prev.selectedMaterialIds.length >= 5) {
        return prev;
      }
      return {
        ...prev,
        selectedMaterialIds: [...prev.selectedMaterialIds, materialId],
      };
    });
  }, []);

  const setGoal = React.useCallback((value: PlanGoal) => {
    if (!isPlanGoal(value)) return;
    setValues((prev) => ({ ...prev, goal: value }));
  }, []);

  const setLevel = React.useCallback((value: PlanLevel) => {
    if (!isPlanLevel(value)) return;
    setValues((prev) => ({ ...prev, level: value }));
  }, []);

  const setDurationMode = React.useCallback((value: "custom" | "adaptive") => {
    setValues((prev) => ({ ...prev, durationMode: value }));
  }, []);

  const setDurationValue = React.useCallback((value: string) => {
    setValues((prev) => ({ ...prev, durationValue: value }));
  }, []);

  const setDurationUnit = React.useCallback(
    (value: "days" | "weeks" | "months") => {
      setValues((prev) => ({ ...prev, durationUnit: value }));
    },
    [],
  );

  const setNotes = React.useCallback((value: string) => {
    setValues((prev) => ({ ...prev, notes: value }));
  }, []);

  const goNext = React.useCallback(() => {
    setError(null);
    if (step === 1) {
      if (values.selectedMaterialIds.length < 1) {
        setError("최소 1개 자료를 선택하세요.");
        return;
      }
      if (values.selectedMaterialIds.length > 5) {
        setError("최대 5개까지 선택할 수 있습니다.");
        return;
      }
      if (hasInvalidSelection) {
        setError("분석 완료 자료만 선택할 수 있습니다.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  }, [hasInvalidSelection, step, values.selectedMaterialIds.length]);

  const goBack = React.useCallback(() => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }, [step]);

  const submit = React.useCallback(() => {
    setError(null);

    if (values.selectedMaterialIds.length < 1) {
      setError("최소 1개 자료를 선택하세요.");
      setStep(1);
      return;
    }
    if (hasInvalidSelection) {
      setError("분석 완료 자료만 선택할 수 있습니다.");
      setStep(1);
      return;
    }
    if (values.durationMode === "custom") {
      const value = Number(values.durationValue);
      if (!Number.isFinite(value) || value <= 0) {
        setError("기간 값을 입력하세요.");
        return;
      }
    }

    const planInput: CreatePlanInput = {
      sourceMaterialIds: values.selectedMaterialIds,
      goal: values.goal,
      level: values.level,
      durationMode: values.durationMode,
      durationValue:
        values.durationMode === "custom"
          ? Number(values.durationValue)
          : undefined,
      durationUnit:
        values.durationMode === "custom" ? values.durationUnit : undefined,
      notes: values.notes.trim().length > 0 ? values.notes : undefined,
    };

    input.submitPlan(planInput);
  }, [hasInvalidSelection, input, values]);

  return {
    step,
    error,
    values,
    derived: {
      filteredMaterials,
      selectedCount,
      hasInvalidSelection,
    },
    setSearch,
    toggleMaterial,
    setGoal,
    setLevel,
    setDurationMode,
    setDurationValue,
    setDurationUnit,
    setNotes,
    goNext,
    goBack,
    submit,
  };
}
