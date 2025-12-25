import * as React from "react";

import type { SessionStep } from "~/mock/schemas";
import type {
  SessionAction,
  SessionController,
  SessionInputs,
  SessionRunInput,
  SessionUiState,
} from "./types";

import { useDebouncedEffect } from "~/hooks/use-debounced-effect";
import { completeSession, saveSessionProgress } from "~/mock/api";

function initFromRun(run: SessionRunInput): SessionUiState {
  const inputs: SessionInputs = {};
  // 기존 입력값 복원
  const checkAnswer = run.inputs.checkAnswer;
  const practice = run.inputs.practice;
  if (typeof checkAnswer === "number") inputs.checkAnswer = checkAnswer;
  if (typeof practice === "string") inputs.practice = practice;
  // 확장 입력값 복원
  const codeInput = run.inputs.codeInput;
  const flashcardRevealed = run.inputs.flashcardRevealed;
  const filledBlanks = run.inputs.filledBlanks;
  if (typeof codeInput === "string") inputs.codeInput = codeInput;
  if (typeof flashcardRevealed === "boolean")
    inputs.flashcardRevealed = flashcardRevealed;
  if (
    filledBlanks &&
    typeof filledBlanks === "object" &&
    !Array.isArray(filledBlanks)
  ) {
    inputs.filledBlanks = filledBlanks as Record<string, string>;
  }

  const lastStep = run.steps[run.steps.length - 1];
  const createdConceptIds =
    lastStep && lastStep.type === "COMPLETE" ? lastStep.createdConceptIds : [];

  return {
    runId: run.runId,
    planId: run.planId,
    sessionId: run.sessionId,
    planTitle: run.planTitle ?? "",
    moduleTitle: run.moduleTitle ?? "",
    sessionTitle: run.sessionTitle ?? "",
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
  if (action.type === "SET_CODE_INPUT") {
    return { ...state, inputs: { ...state.inputs, codeInput: action.value } };
  }
  if (action.type === "SET_FLASHCARD_REVEALED") {
    return {
      ...state,
      inputs: { ...state.inputs, flashcardRevealed: action.value },
    };
  }
  if (action.type === "SET_FILLED_BLANK") {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        filledBlanks: {
          ...(state.inputs.filledBlanks ?? {}),
          [action.blankId]: action.value,
        },
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
    case "CHECK":
      return typeof state.inputs.checkAnswer === "number";
    case "FLASHCARD":
      // FLASHCARD는 뒷면을 확인해야 다음으로 진행 가능
      return state.inputs.flashcardRevealed === true;
    case "FILL_BLANK": {
      // 모든 빈칸이 채워져야 진행 가능
      const blanks = step.blanks;
      const filled = state.inputs.filledBlanks ?? {};
      return blanks.every((b) => {
        const answer = filled[b.id];
        return typeof answer === "string" && answer.trim().length > 0;
      });
    }
    default:
      return true;
  }
}

export function useSessionController(run: SessionRunInput): SessionController {
  const [state, dispatch] = React.useReducer(reducer, run, initFromRun);

  const activeStep = state.steps[state.currentStep];
  const progressPercent =
    state.totalSteps > 1
      ? Math.round((state.currentStep / (state.totalSteps - 1)) * 100)
      : 0;

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

  const setCodeInput = React.useCallback((value: string) => {
    dispatch({ type: "SET_CODE_INPUT", value });
  }, []);

  const setFlashcardRevealed = React.useCallback((value: boolean) => {
    dispatch({ type: "SET_FLASHCARD_REVEALED", value });
  }, []);

  const setFilledBlank = React.useCallback((blankId: string, value: string) => {
    dispatch({ type: "SET_FILLED_BLANK", blankId, value });
  }, []);

  const goPrev = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;
    dispatch({ type: "PREV" });
  }, [state.status]);

  const goNext = React.useCallback(() => {
    if (state.status !== "ACTIVE") return;

    const currentStepData = state.steps[state.currentStep];

    // CHECK 스텝에서 답을 선택하지 않았으면 진행 불가
    if (
      currentStepData.type === "CHECK" &&
      typeof state.inputs.checkAnswer !== "number"
    ) {
      return;
    }

    // 다음 스텝이 COMPLETE인지 확인 (현재 스텝이 마지막 사용자 입력 스텝인지)
    const nextStep = state.steps[state.currentStep + 1];
    const isBeforeComplete = nextStep && nextStep.type === "COMPLETE";

    if (isBeforeComplete) {
      // COMPLETE 직전이면 세션 완료 처리
      dispatch({ type: "SET_COMPLETING" });
      const result = completeSession({ runId: state.runId });
      dispatch({
        type: "SET_COMPLETED",
        createdConceptIds: result.createdConceptIds,
      });
      dispatch({ type: "NEXT" });
      return;
    }

    dispatch({ type: "NEXT" });
  }, [
    state.currentStep,
    state.inputs.checkAnswer,
    state.runId,
    state.status,
    state.steps,
  ]);

  return {
    state,
    activeStep,
    progressPercent,
    canGoNext: canProceed(activeStep, state),
    goNext,
    goPrev,
    setCheckAnswer,
    setPractice,
    setCodeInput,
    setFlashcardRevealed,
    setFilledBlank,
    saveNow,
  };
}
