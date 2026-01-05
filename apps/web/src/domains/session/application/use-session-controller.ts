import * as React from "react";

import { completeSessionRun, saveSessionRunProgress } from "../api";

import type {
  SessionAction,
  SessionController,
  SessionInputs,
  SessionRunInput,
  SessionStep,
  SessionUiState,
} from "../model/types";

import { useDebouncedEffect } from "~/foundation/hooks/use-debounced-effect";
import { nowIso } from "~/foundation/lib/time";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordOfNumbers(value: unknown): Record<string, number> | undefined {
  if (!isPlainRecord(value)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function recordOfBooleans(value: unknown): Record<string, boolean> | undefined {
  if (!isPlainRecord(value)) return undefined;
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "boolean") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function recordOfStrings(value: unknown): Record<string, string> | undefined {
  if (!isPlainRecord(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function recordOfRecordOfStrings(
  value: unknown,
): Record<string, Record<string, string>> | undefined {
  if (!isPlainRecord(value)) return undefined;
  const out: Record<string, Record<string, string>> = {};
  for (const [k, v] of Object.entries(value)) {
    const inner = recordOfStrings(v);
    if (inner) out[k] = inner;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function initFromRun(run: SessionRunInput): SessionUiState {
  const inputs: SessionInputs = {};

  const answers = recordOfNumbers(run.inputs.answers);
  if (answers) inputs.answers = answers;

  const flashcardRevealed = recordOfBooleans(run.inputs.flashcardRevealed);
  if (flashcardRevealed) inputs.flashcardRevealed = flashcardRevealed;

  const flashcardResult = recordOfStrings(run.inputs.flashcardResult) as
    | Record<string, "know" | "dontknow">
    | undefined;
  if (flashcardResult) inputs.flashcardResult = flashcardResult;

  const speedOxAnswers = recordOfBooleans(run.inputs.speedOxAnswers);
  if (speedOxAnswers) inputs.speedOxAnswers = speedOxAnswers;

  const matchingConnections = recordOfRecordOfStrings(
    run.inputs.matchingConnections,
  );
  if (matchingConnections) inputs.matchingConnections = matchingConnections;

  return {
    runId: run.runId,
    planId: run.planId,
    sessionId: run.sessionId,
    planTitle: run.planTitle ?? "",
    moduleTitle: run.moduleTitle ?? "",
    sessionTitle: run.sessionTitle ?? "",
    blueprint: run.blueprint,
    currentStepId: run.currentStepId,
    stepHistory: run.stepHistory,
    historyIndex: Math.max(
      0,
      Math.min(run.stepHistory.length - 1, run.historyIndex),
    ),
    inputs,
    isRecovery: run.isRecovery,
    status: run.status === "COMPLETED" ? "COMPLETED" : "ACTIVE",
    createdConceptIds: run.createdConceptIds,
    startedAt: nowIso(),
  };
}

function reducer(state: SessionUiState, action: SessionAction): SessionUiState {
  if (action.type === "GO_PREV") {
    const nextIndex = Math.max(0, state.historyIndex - 1);
    return {
      ...state,
      historyIndex: nextIndex,
      currentStepId: state.stepHistory[nextIndex] ?? state.currentStepId,
    };
  }

  if (action.type === "GO_NEXT") {
    const head = state.stepHistory.slice(0, state.historyIndex + 1);
    const nextHistory = [...head, action.nextStepId];
    return {
      ...state,
      stepHistory: nextHistory,
      historyIndex: nextHistory.length - 1,
      currentStepId: action.nextStepId,
    };
  }

  if (action.type === "SET_ANSWER") {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        answers: {
          ...(state.inputs.answers ?? {}),
          [action.stepId]: action.value,
        },
      },
    };
  }

  if (action.type === "SET_FLASHCARD_REVEALED") {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        flashcardRevealed: {
          ...(state.inputs.flashcardRevealed ?? {}),
          [action.stepId]: action.value,
        },
      },
    };
  }

  if (action.type === "SET_FLASHCARD_RESULT") {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        flashcardResult: {
          ...(state.inputs.flashcardResult ?? {}),
          [action.stepId]: action.value,
        },
      },
    };
  }

  if (action.type === "SET_SPEED_OX_ANSWER") {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        speedOxAnswers: {
          ...(state.inputs.speedOxAnswers ?? {}),
          [action.stepId]: action.value,
        },
      },
    };
  }

  if (action.type === "SET_MATCHING_CONNECTION") {
    const existing = state.inputs.matchingConnections?.[action.stepId] ?? {};
    return {
      ...state,
      inputs: {
        ...state.inputs,
        matchingConnections: {
          ...(state.inputs.matchingConnections ?? {}),
          [action.stepId]: {
            ...existing,
            [action.leftId]: action.rightId,
          },
        },
      },
    };
  }

  if (action.type === "CLEAR_MATCHING") {
    const copy = { ...(state.inputs.matchingConnections ?? {}) };
    delete copy[action.stepId];
    return {
      ...state,
      inputs: {
        ...state.inputs,
        matchingConnections: copy,
      },
    };
  }

  if (action.type === "SET_CHECK_RESULT") {
    return {
      ...state,
      checkResults: {
        ...(state.checkResults ?? {}),
        [action.stepId]: action.correct,
      },
    };
  }

  if (action.type === "SET_COMPLETING") {
    return { ...state, status: "COMPLETING" };
  }

  if (action.type === "SET_COMPLETED") {
    return {
      ...state,
      status: "COMPLETED",
      createdConceptIds: action.createdConceptIds,
    };
  }

  return state;
}

function canProceed(step: SessionStep, state: SessionUiState): boolean {
  if (state.status !== "ACTIVE") return false;

  switch (step.type) {
    case "SESSION_INTRO":
      return true; // 항상 진행 가능

    case "CONCEPT":
      return true; // 읽기만 하면 됨

    case "CHECK":
    case "CLOZE":
    case "APPLICATION":
      return typeof state.inputs.answers?.[step.id] === "number";

    case "FLASHCARD": {
      const revealed = state.inputs.flashcardRevealed?.[step.id] === true;
      const hasResult = state.inputs.flashcardResult?.[step.id] !== undefined;
      return revealed && hasResult;
    }

    case "SPEED_OX":
      return state.inputs.speedOxAnswers?.[step.id] !== undefined;

    case "MATCHING": {
      const connections = state.inputs.matchingConnections?.[step.id] ?? {};
      return Object.keys(connections).length === step.pairs.length;
    }

    case "SESSION_SUMMARY":
      return true; // 완료 화면

    default:
      return true;
  }
}

export function useSessionController(run: SessionRunInput): SessionController {
  const [state, dispatch] = React.useReducer(reducer, run, initFromRun);

  const { stepsById, indexById } = React.useMemo(() => {
    const byId = new Map<string, SessionStep>();
    const idx = new Map<string, number>();
    state.blueprint.steps.forEach((step, i) => {
      byId.set(step.id, step);
      idx.set(step.id, i);
    });
    return { stepsById: byId, indexById: idx };
  }, [state.blueprint.steps]);

  const resolveNextStepId = React.useCallback(
    (fromStepId: string): string | null => {
      const step = stepsById.get(fromStepId);
      if (!step) return null;

      // 명시적 next가 있으면 사용
      if (step.next) {
        if ("default" in step.next) return step.next.default;
        // branches는 복잡한 로직이므로 지금은 첫 번째 분기 사용
        if (step.next.branches.length > 0) {
          return step.next.branches[0]?.to ?? null;
        }
      }

      // 없으면 순서대로 다음 스텝
      const idx = indexById.get(fromStepId);
      if (typeof idx !== "number") return null;
      const next = state.blueprint.steps[idx + 1];
      return next ? next.id : null;
    },
    [indexById, state.blueprint.steps, stepsById],
  );

  const predictedPath = React.useMemo(() => {
    const path: Array<string> = [];
    const seen = new Set<string>();
    let cursor: string | null = state.blueprint.startStepId;

    while (cursor) {
      if (seen.has(cursor)) break;
      seen.add(cursor);

      const step = stepsById.get(cursor);
      if (!step) break;

      path.push(cursor);
      cursor = resolveNextStepId(cursor);
    }

    return path.length > 0 ? path : [state.blueprint.startStepId];
  }, [resolveNextStepId, state.blueprint.startStepId, stepsById]);

  const activeStep = React.useMemo(() => {
    const direct = stepsById.get(state.currentStepId);
    if (direct) return direct;
    const fallback = stepsById.get(
      predictedPath[0] ?? state.blueprint.startStepId,
    );
    return fallback ?? state.blueprint.steps[0];
  }, [
    predictedPath,
    state.blueprint.startStepId,
    state.blueprint.steps,
    state.currentStepId,
    stepsById,
  ]);

  const activeIndex = Math.max(0, predictedPath.indexOf(activeStep.id));
  const totalSteps = predictedPath.length;
  const progressPercent =
    totalSteps > 1 ? Math.round((activeIndex / (totalSteps - 1)) * 100) : 0;

  const nextStepId = resolveNextStepId(activeStep.id);
  const nextStep = nextStepId ? (stepsById.get(nextStepId) ?? null) : null;

  const persistedInputs = React.useMemo(() => {
    const out: Record<string, unknown> = {};

    if (state.inputs.answers && Object.keys(state.inputs.answers).length > 0) {
      out.answers = state.inputs.answers;
    }
    if (
      state.inputs.flashcardRevealed &&
      Object.keys(state.inputs.flashcardRevealed).length > 0
    ) {
      out.flashcardRevealed = state.inputs.flashcardRevealed;
    }
    if (
      state.inputs.flashcardResult &&
      Object.keys(state.inputs.flashcardResult).length > 0
    ) {
      out.flashcardResult = state.inputs.flashcardResult;
    }
    if (
      state.inputs.speedOxAnswers &&
      Object.keys(state.inputs.speedOxAnswers).length > 0
    ) {
      out.speedOxAnswers = state.inputs.speedOxAnswers;
    }
    if (
      state.inputs.matchingConnections &&
      Object.keys(state.inputs.matchingConnections).length > 0
    ) {
      out.matchingConnections = state.inputs.matchingConnections;
    }

    return out;
  }, [state.inputs]);

  const saveNow = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;
    const stepIndex = Math.max(
      0,
      state.blueprint.steps.findIndex((s) => s.id === state.currentStepId),
    );
    void saveSessionRunProgress({
      runId: state.runId,
      stepIndex,
      inputs: persistedInputs,
    });
  }, [
    state.blueprint.steps,
    state.currentStepId,
    persistedInputs,
    state.runId,
    state.status,
  ]);

  useDebouncedEffect(
    () => {
      saveNow();
    },
    [saveNow],
    3000,
  );

  const setAnswer = React.useCallback(
    (value: number) => {
      dispatch({ type: "SET_ANSWER", stepId: activeStep.id, value });
    },
    [activeStep.id],
  );

  const setFlashcardRevealed = React.useCallback(
    (value: boolean) => {
      dispatch({
        type: "SET_FLASHCARD_REVEALED",
        stepId: activeStep.id,
        value,
      });
    },
    [activeStep.id],
  );

  const setFlashcardResult = React.useCallback(
    (value: "know" | "dontknow") => {
      dispatch({ type: "SET_FLASHCARD_RESULT", stepId: activeStep.id, value });
    },
    [activeStep.id],
  );

  const setSpeedOxAnswer = React.useCallback(
    (value: boolean) => {
      dispatch({ type: "SET_SPEED_OX_ANSWER", stepId: activeStep.id, value });
    },
    [activeStep.id],
  );

  const setMatchingConnection = React.useCallback(
    (leftId: string, rightId: string) => {
      dispatch({
        type: "SET_MATCHING_CONNECTION",
        stepId: activeStep.id,
        leftId,
        rightId,
      });
    },
    [activeStep.id],
  );

  const clearMatching = React.useCallback(() => {
    dispatch({ type: "CLEAR_MATCHING", stepId: activeStep.id });
  }, [activeStep.id]);

  const goPrev = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;
    if (state.historyIndex === 0) return;
    dispatch({ type: "GO_PREV" });
  }, [state.historyIndex, state.status]);

  const goNext = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;

    const fromStep = stepsById.get(state.currentStepId);
    if (!fromStep) return;
    if (!canProceed(fromStep, state)) return;

    const nextId = resolveNextStepId(fromStep.id);
    if (!nextId) return;

    const next = stepsById.get(nextId);
    const isBeforeSummary = next?.type === "SESSION_SUMMARY";

    if (isBeforeSummary) {
      saveNow();
      dispatch({ type: "SET_COMPLETING" });
      dispatch({ type: "SET_COMPLETED", createdConceptIds: [] });
      void completeSessionRun(state.runId);
    }

    dispatch({ type: "GO_NEXT", nextStepId: nextId });
  }, [resolveNextStepId, state, stepsById, saveNow]);

  return {
    state,
    activeStep,
    nextStep,
    progressPercent,
    currentStepNumber: activeIndex + 1,
    totalSteps,
    canGoNext: canProceed(activeStep, state),
    canGoPrev: state.status === "ACTIVE" && state.historyIndex > 0,
    goNext,
    goPrev,
    setAnswer,
    setFlashcardRevealed,
    setFlashcardResult,
    setSpeedOxAnswer,
    setMatchingConnection,
    clearMatching,
    saveNow,
  };
}
