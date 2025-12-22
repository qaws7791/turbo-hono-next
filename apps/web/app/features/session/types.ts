import type { SessionRun, SessionStep } from "~/mock/schemas";

export type SessionInputs = {
  checkAnswer?: number;
  practice?: string;
};

export type SessionUiState = {
  runId: string;
  planId: string;
  sessionId: string;
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
  saveNow: () => void;
};

export type SessionRunInput = SessionRun;

