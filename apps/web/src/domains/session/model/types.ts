export type SessionStepType =
  | "SESSION_INTRO"
  | "SESSION_SUMMARY"
  | "CHECK"
  | "CLOZE"
  | "MATCHING"
  | "FLASHCARD"
  | "SPEED_OX"
  | "APPLICATION";

export type SessionStepId = string;

export type SessionStepIntent =
  | "INTRO"
  | "EXPLAIN"
  | "RETRIEVAL"
  | "PRACTICE"
  | "WRAPUP";

export type SessionStepGating = {
  required?: boolean;
  when?: string;
};

export type SessionStepNext =
  | { default: SessionStepId }
  | { branches: Array<{ when: string; to: SessionStepId }> };

type SessionStepBase = {
  id: SessionStepId;
  estimatedSeconds?: number;
  intent?: SessionStepIntent;
  gating?: SessionStepGating;
  next?: SessionStepNext;
};

export type SessionIntroStep = SessionStepBase & {
  type: "SESSION_INTRO";
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  durationMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  learningGoals: Array<string>;
  questionsToCover: Array<string>;
  prerequisites: Array<string>;
};

export type CheckStep = SessionStepBase & {
  type: "CHECK";
  question: string;
  options: Array<string>;
  answerIndex: number;
  explanation?: string;
};

export type ClozeStep = SessionStepBase & {
  type: "CLOZE";
  sentence: string;
  blankId: string;
  options: Array<string>;
  answerIndex: number;
  explanation?: string;
};

export type MatchingStep = SessionStepBase & {
  type: "MATCHING";
  instruction: string;
  pairs: Array<{ id: string; left: string; right: string }>;
};

export type FlashcardStep = SessionStepBase & {
  type: "FLASHCARD";
  front: string;
  back: string;
};

export type SpeedOxStep = SessionStepBase & {
  type: "SPEED_OX";
  statement: string;
  isTrue: boolean;
  explanation?: string;
};

export type ApplicationStep = SessionStepBase & {
  type: "APPLICATION";
  scenario: string;
  question: string;
  options: Array<string>;
  correctIndex: number;
  feedback?: string;
};

export type SessionSummaryStep = SessionStepBase & {
  type: "SESSION_SUMMARY";
  celebrationEmoji: string;
  encouragement: string;
  studyTimeMinutes?: number;
  completedActivities: Array<string>;
  keyTakeaways: Array<string>;
  nextSessionPreview?: { title: string; description?: string };
};

export type SessionStep =
  | SessionIntroStep
  | CheckStep
  | ClozeStep
  | MatchingStep
  | FlashcardStep
  | SpeedOxStep
  | ApplicationStep
  | SessionSummaryStep;

export type SessionBlueprint = {
  schemaVersion: number;
  blueprintId: string;
  createdAt: string;
  context: {
    planId: string;
    moduleId: string | null;
    planSessionId: string;
    sessionType: "session";
  };
  timeBudget: {
    targetMinutes: number;
    minMinutes: number;
    maxMinutes: number;
    profile: "MICRO" | "STANDARD" | "DEEP";
  };
  steps: Array<SessionStep>;
  startStepId: SessionStepId;
};

export type SessionRunStatus = "ACTIVE" | "COMPLETING" | "COMPLETED";

export type SessionRun = {
  runId: string;
  planId: string;
  sessionId: string;
  blueprintId: string;
  isRecovery: boolean;
  createdAt: string;
  updatedAt: string;
  currentStepId: SessionStepId;
  stepHistory: Array<SessionStepId>;
  historyIndex: number;
  inputs: Record<string, unknown>;
  status: SessionRunStatus;
};

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
  | { type: "SET_COMPLETED" };

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
