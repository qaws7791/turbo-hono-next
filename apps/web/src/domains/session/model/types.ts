import type {
  SessionBlueprint,
  SessionRun,
  SessionStep,
} from "~/app/mocks/schemas";

export type SessionInputs = {
  // CHECK, CLOZE, APPLICATION 답변 (stepId -> 선택한 인덱스)
  answers?: Record<string, number>;
  // FLASHCARD 뒤집기 상태 (stepId -> revealed)
  flashcardRevealed?: Record<string, boolean>;
  // FLASHCARD 알아요/몰라요 (stepId -> "know" | "dontknow")
  flashcardResult?: Record<string, "know" | "dontknow">;
  // SPEED_OX 답변 (stepId -> 사용자가 선택한 boolean)
  speedOxAnswers?: Record<string, boolean>;
  // MATCHING 연결 상태 (stepId -> { leftId: rightId })
  matchingConnections?: Record<string, Record<string, string>>;
};

export type SessionUiState = {
  runId: string;
  planId: string;
  sessionId: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  blueprint: SessionBlueprint;
  currentStepId: string;
  stepHistory: Array<string>;
  historyIndex: number;
  inputs: SessionInputs;
  isRecovery: boolean;
  status: "ACTIVE" | "COMPLETING" | "COMPLETED";
  createdConceptIds: Array<string>;
  // 정답 체크 결과 (stepId -> correct 여부)
  checkResults?: Record<string, boolean>;
  // 시작 시간 (분 계산용)
  startedAt?: string;
};

export type SessionAction =
  | { type: "GO_NEXT"; nextStepId: string }
  | { type: "GO_PREV" }
  | { type: "SET_ANSWER"; stepId: string; value: number }
  | { type: "SET_FLASHCARD_REVEALED"; stepId: string; value: boolean }
  | { type: "SET_FLASHCARD_RESULT"; stepId: string; value: "know" | "dontknow" }
  | { type: "SET_SPEED_OX_ANSWER"; stepId: string; value: boolean }
  | {
      type: "SET_MATCHING_CONNECTION";
      stepId: string;
      leftId: string;
      rightId: string;
    }
  | { type: "CLEAR_MATCHING"; stepId: string }
  | { type: "SET_CHECK_RESULT"; stepId: string; correct: boolean }
  | { type: "SET_COMPLETING" }
  | { type: "SET_COMPLETED"; createdConceptIds: Array<string> };

export type SessionController = {
  state: SessionUiState;
  activeStep: SessionStep;
  nextStep: SessionStep | null;
  progressPercent: number;
  currentStepNumber: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  // CHECK, CLOZE, APPLICATION
  setAnswer: (value: number) => void;
  // FLASHCARD
  setFlashcardRevealed: (value: boolean) => void;
  setFlashcardResult: (value: "know" | "dontknow") => void;
  // SPEED_OX
  setSpeedOxAnswer: (value: boolean) => void;
  // MATCHING
  setMatchingConnection: (leftId: string, rightId: string) => void;
  clearMatching: () => void;
  // Utility
  saveNow: () => void;
};

export type SessionRunInput = SessionRun & {
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  blueprint: SessionBlueprint;
};
