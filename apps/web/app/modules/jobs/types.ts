export type JobStatusState = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type JobResult = {
  materialId: string;
  summary: string | null;
};

export type JobError = {
  code: string;
  message: string;
};

export type JobStatus = {
  jobId: string;
  status: JobStatusState;
  progress: number | null;
  currentStep: string | null;
  result: JobResult | null;
  error: JobError | null;
};
