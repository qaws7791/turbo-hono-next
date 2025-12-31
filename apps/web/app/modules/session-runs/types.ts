export type SessionRunStatus = "RUNNING" | "COMPLETED" | "ABANDONED";

export type SessionRunStartData = {
  runId: string;
  sessionId: string;
  status: SessionRunStatus;
  isRecovery: boolean;
  currentStep: number;
};

export type StartSessionRunResponseCreated =
  { data: SessionRunStartData };
export type StartSessionRunResponseOk =
  { data: SessionRunStartData };

export type SaveProgressBody = {
  stepIndex: number;
  inputs: Record<string, unknown>;
};

export type SaveProgressResponse = {
  data: { runId: string; savedAt: string };
};

export type CompleteRunResponse = {
  data: {
    runId: string;
    status: SessionRunStatus;
    conceptsCreated: number;
    summary: { id: string } | null;
  };
};

export type AbandonRunReason = "USER_EXIT" | "NETWORK" | "ERROR" | "TIMEOUT";

export type AbandonRunBody = {
  reason: AbandonRunReason;
};

export type AbandonRunResponse = {
  data: { runId: string; status: SessionRunStatus };
};
