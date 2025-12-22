import * as React from "react";

import type { SessionRun, SessionStep } from "~/mock/schemas";
import type { SessionAction, SessionController, SessionInputs, SessionUiState } from "./types";

import { useDebouncedEffect } from "~/hooks/use-debounced-effect";
import { completeSession, saveSessionProgress } from "~/mock/api";


function initFromRun(run: SessionRun): SessionUiState {
  const inputs: SessionInputs = {};
  const checkAnswer = run.inputs.checkAnswer;
  const practice = run.inputs.practice;
  if (typeof checkAnswer === "number") inputs.checkAnswer = checkAnswer;
  if (typeof practice === "string") inputs.practice = practice;

  const lastStep = run.steps[run.steps.length - 1];
  const createdConceptIds =
    lastStep && lastStep.type === "COMPLETE" ? lastStep.createdConceptIds : [];

  return {
    runId: run.runId,
    planId: run.planId,
    sessionId: run.sessionId,
    currentStep: run.currentStep,
    totalSteps: run.totalSteps,
    steps: run.steps,
    inputs,
    isRecovery: run.isRecovery,
    status: run.status === "COMPLETED" ? "COMPLETED" : "ACTIVE",
    createdConceptIds,
  };
}

function reducer(state: SessionUiState, action: SessionAction): SessionUiState {
  if (action.type === "PREV") {
    return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
  }
  if (action.type === "NEXT") {
    return {
      ...state,
      currentStep: Math.min(state.totalSteps - 1, state.currentStep + 1),
    };
  }
  if (action.type === "SET_CHECK_ANSWER") {
    return { ...state, inputs: { ...state.inputs, checkAnswer: action.value } };
  }
  if (action.type === "SET_PRACTICE") {
    return { ...state, inputs: { ...state.inputs, practice: action.value } };
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
  if (step.type === "CHECK") {
    return typeof state.inputs.checkAnswer === "number";
  }
  return true;
}

export function useSessionController(run: SessionRun): SessionController {
  const [state, dispatch] = React.useReducer(reducer, run, initFromRun);

  const activeStep = state.steps[state.currentStep];
  const progressPercent = Math.round(
    ((state.currentStep + 1) / state.totalSteps) * 100,
  );

  const saveNow = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;
    saveSessionProgress({
      runId: state.runId,
      currentStep: state.currentStep,
      inputs: state.inputs,
    });
  }, [state.currentStep, state.inputs, state.runId, state.status]);

  useDebouncedEffect(
    () => {
      saveNow();
    },
    [saveNow],
    3000,
  );

  const setCheckAnswer = React.useCallback((value: number) => {
    dispatch({ type: "SET_CHECK_ANSWER", value });
  }, []);

  const setPractice = React.useCallback((value: string) => {
    dispatch({ type: "SET_PRACTICE", value });
  }, []);

  const goPrev = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;
    dispatch({ type: "PREV" });
  }, [state.status]);

  const goNext = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;

    const step = state.steps[state.currentStep];
    if (step.type === "CHECK" && typeof state.inputs.checkAnswer !== "number") {
      return;
    }

    if (step.type === "PRACTICE") {
      dispatch({ type: "SET_COMPLETING" });
      const result = completeSession({ runId: state.runId });
      dispatch({ type: "SET_COMPLETED", createdConceptIds: result.createdConceptIds });
      dispatch({ type: "NEXT" });
      return;
    }

    dispatch({ type: "NEXT" });
  }, [state.currentStep, state.inputs.checkAnswer, state.runId, state.status, state.steps]);

  return {
    state,
    activeStep,
    progressPercent,
    canGoNext: canProceed(activeStep, state),
    goNext,
    goPrev,
    setCheckAnswer,
    setPractice,
    saveNow,
  };
}

