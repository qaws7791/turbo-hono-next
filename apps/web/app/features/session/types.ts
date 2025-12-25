import type { SessionRun, SessionStep } from "~/mock/schemas";

export type SessionInputs = {
  // 기존 입력
  checkAnswer?: number;
  practice?: string;
  // 확장 입력
  codeInput?: string; // CODE 스텝용
  flashcardRevealed?: boolean; // FLASHCARD 스텝용 (뒷면 확인 여부)
  filledBlanks?: Record<string, string>; // FILL_BLANK 스텝용
};

export type SessionUiState = {
  runId: string;
  planId: string;
  sessionId: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  currentStep: number;
  totalSteps: number;
  steps: Array<SessionStep>;
  inputs: SessionInputs;
  isRecovery: boolean;
  status: "ACTIVE" | "COMPLETING" | "COMPLETED";
  createdConceptIds: Array<string>;
};

export type SessionAction =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SET_CHECK_ANSWER"; value: number }
  | { type: "SET_PRACTICE"; value: string }
  | { type: "SET_CODE_INPUT"; value: string }
  | { type: "SET_FLASHCARD_REVEALED"; value: boolean }
  | { type: "SET_FILLED_BLANK"; blankId: string; value: string }
  | { type: "SET_COMPLETING" }
  | { type: "SET_COMPLETED"; createdConceptIds: Array<string> };

export type SessionController = {
  state: SessionUiState;
  activeStep: SessionStep;
  progressPercent: number;
  canGoNext: boolean;
  goNext: () => void;
  goPrev: () => void;
  setCheckAnswer: (value: number) => void;
  setPractice: (value: string) => void;
  setCodeInput: (value: string) => void;
  setFlashcardRevealed: (value: boolean) => void;
  setFilledBlank: (blankId: string, value: string) => void;
  saveNow: () => void;
};

export type SessionRunInput = SessionRun & {
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
};
