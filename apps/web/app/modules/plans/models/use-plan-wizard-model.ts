import * as React from "react";

import type { MaterialListItem } from "~/modules/materials";
import type { CreatePlanBody } from "~/modules/plans";
import type {
  PlanWizardModel,
  PlanWizardStep,
  PlanWizardValues,
} from "../types";

function canSelectMaterial(material: MaterialListItem): boolean {
  return material.processingStatus === "READY";
}

function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function usePlanWizardModel(input: {
  materials: Array<MaterialListItem>;
  submitPlan: (body: CreatePlanBody) => void;
}): PlanWizardModel {
  const [step, setStep] = React.useState<PlanWizardStep>(1);
  const [error, setError] = React.useState<string | null>(null);

  const [values, setValues] = React.useState<PlanWizardValues>({
    selectedMaterialIds: [],
    search: "",
    goalType: "WORK",
    currentLevel: "BEGINNER",
    targetDueDate: addDaysToToday(30),
    specialRequirements: "",
  });

  const normalized = values.search.trim().toLowerCase();
  const filteredMaterials = React.useMemo(() => {
    return input.materials.filter((material) => {
      if (!normalized) return true;
      const hay =
        `${material.title} ${material.summary ?? ""} ${material.tags.join(" ")}`
          .toLowerCase()
          .trim();
      return hay.includes(normalized);
    });
  }, [input.materials, normalized]);

  const selectedCount = values.selectedMaterialIds.length;
  const hasInvalidSelection = values.selectedMaterialIds.some((id) => {
    const material = input.materials.find((m) => m.id === id);
    return !material || !canSelectMaterial(material);
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

  const setGoalType = React.useCallback((value: CreatePlanBody["goalType"]) => {
    setValues((prev) => ({ ...prev, goalType: value }));
  }, []);

  const setCurrentLevel = React.useCallback(
    (value: CreatePlanBody["currentLevel"]) => {
      setValues((prev) => ({ ...prev, currentLevel: value }));
    },
    [],
  );

  const setTargetDueDate = React.useCallback((value: string) => {
    setValues((prev) => ({ ...prev, targetDueDate: value }));
  }, []);

  const setSpecialRequirements = React.useCallback((value: string) => {
    setValues((prev) => ({ ...prev, specialRequirements: value }));
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
        setError("분석 완료(READY) 자료만 선택할 수 있습니다.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!isIsoDate(values.targetDueDate)) {
        setError("목표 기한(YYYY-MM-DD)을 확인하세요.");
        return;
      }
      setStep(3);
    }
  }, [
    hasInvalidSelection,
    step,
    values.selectedMaterialIds.length,
    values.targetDueDate,
  ]);

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
      setError("분석 완료(READY) 자료만 선택할 수 있습니다.");
      setStep(1);
      return;
    }
    if (!isIsoDate(values.targetDueDate)) {
      setError("목표 기한(YYYY-MM-DD)을 확인하세요.");
      setStep(2);
      return;
    }

    input.submitPlan({
      materialIds: values.selectedMaterialIds,
      goalType: values.goalType,
      currentLevel: values.currentLevel,
      targetDueDate: values.targetDueDate,
      specialRequirements:
        values.specialRequirements.trim().length > 0
          ? values.specialRequirements.trim()
          : undefined,
    });
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
    setGoalType,
    setCurrentLevel,
    setTargetDueDate,
    setSpecialRequirements,
    goNext,
    goBack,
    submit,
  };
}
