import * as React from "react";

import type { Document, PlanGoal, PlanLevel } from "~/app/mocks/schemas";
import type {
  PlanWizardModel,
  PlanWizardStep,
  PlanWizardValues,
} from "~/domains/plans/model";

import { PlanGoalSchema, PlanLevelSchema } from "~/app/mocks/schemas";

function canSelectDocument(doc: Document): boolean {
  return doc.status === "completed";
}

export function usePlanWizardModel(input: {
  documents: Array<Document>;
  submitPlan: (formData: FormData) => void;
}): PlanWizardModel {
  const [step, setStep] = React.useState<PlanWizardStep>(1);
  const [error, setError] = React.useState<string | null>(null);

  const [values, setValues] = React.useState<PlanWizardValues>({
    selectedDocumentIds: [],
    search: "",
    goal: "work",
    level: "basic",
    durationMode: "adaptive",
    durationValue: "",
    durationUnit: "weeks",
    notes: "",
  });

  const normalized = values.search.trim().toLowerCase();
  const filteredDocuments = React.useMemo(() => {
    return input.documents.filter((doc) => {
      if (!normalized) return true;
      const hay =
        `${doc.title} ${doc.summary ?? ""} ${doc.tags.join(" ")}`.toLowerCase();
      return hay.includes(normalized);
    });
  }, [input.documents, normalized]);

  const selectedCount = values.selectedDocumentIds.length;
  const hasInvalidSelection = values.selectedDocumentIds.some((id) => {
    const doc = input.documents.find((d) => d.id === id);
    return !doc || !canSelectDocument(doc);
  });

  const setSearch = React.useCallback((value: string) => {
    setValues((prev) => ({ ...prev, search: value }));
  }, []);

  const toggleDocument = React.useCallback((documentId: string) => {
    setValues((prev) => {
      if (prev.selectedDocumentIds.includes(documentId)) {
        return {
          ...prev,
          selectedDocumentIds: prev.selectedDocumentIds.filter(
            (id) => id !== documentId,
          ),
        };
      }
      if (prev.selectedDocumentIds.length >= 5) {
        return prev;
      }
      return {
        ...prev,
        selectedDocumentIds: [...prev.selectedDocumentIds, documentId],
      };
    });
  }, []);

  const setGoal = React.useCallback((value: PlanGoal) => {
    const parsed = PlanGoalSchema.safeParse(value);
    if (!parsed.success) return;
    setValues((prev) => ({ ...prev, goal: parsed.data }));
  }, []);

  const setLevel = React.useCallback((value: PlanLevel) => {
    const parsed = PlanLevelSchema.safeParse(value);
    if (!parsed.success) return;
    setValues((prev) => ({ ...prev, level: parsed.data }));
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
      if (values.selectedDocumentIds.length < 1) {
        setError("최소 1개 문서를 선택하세요.");
        return;
      }
      if (values.selectedDocumentIds.length > 5) {
        setError("최대 5개까지 선택할 수 있습니다.");
        return;
      }
      if (hasInvalidSelection) {
        setError("분석 완료 문서만 선택할 수 있습니다.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  }, [hasInvalidSelection, step, values.selectedDocumentIds.length]);

  const goBack = React.useCallback(() => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }, [step]);

  const submit = React.useCallback(() => {
    setError(null);

    if (values.selectedDocumentIds.length < 1) {
      setError("최소 1개 문서를 선택하세요.");
      setStep(1);
      return;
    }
    if (hasInvalidSelection) {
      setError("분석 완료 문서만 선택할 수 있습니다.");
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

    const fd = new FormData();
    fd.set("intent", "create-plan");
    for (const id of values.selectedDocumentIds) {
      fd.append("sourceDocumentIds", id);
    }
    fd.set("goal", values.goal);
    fd.set("level", values.level);
    fd.set("durationMode", values.durationMode);
    if (values.durationMode === "custom") {
      fd.set("durationValue", values.durationValue);
      fd.set("durationUnit", values.durationUnit);
    }
    if (values.notes.trim().length > 0) {
      fd.set("notes", values.notes);
    }

    input.submitPlan(fd);
  }, [hasInvalidSelection, input, values]);

  return {
    step,
    error,
    values,
    derived: {
      filteredDocuments,
      selectedCount,
      hasInvalidSelection,
    },
    setSearch,
    toggleDocument,
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
