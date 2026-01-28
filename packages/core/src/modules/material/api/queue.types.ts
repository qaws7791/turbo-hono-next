import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";

export type MaterialProcessingJobData = {
  readonly userId: string;
  readonly uploadId: string;
  readonly title: string;
  readonly etag?: string;
};

export type MaterialProcessingJobResult = {
  readonly materialId: string;
  readonly title: string;
  readonly summary: string | null;
  readonly processingStatus: "READY" | "FAILED";
};

export type MaterialProcessingProgress = {
  readonly step:
    | "VALIDATING"
    | "PARSING"
    | "ANALYZING"
    | "INDEXING"
    | "FINALIZING"
    | "COMPLETED";
  readonly progress: number;
  readonly message?: string;
};

export type MaterialProcessingQueuePort = {
  add: (
    name: string,
    data: MaterialProcessingJobData,
    options?: {
      jobId?: string;
      removeOnComplete?: boolean;
      removeOnFail?: boolean | { count: number };
    },
  ) => ResultAsync<{ jobId: string }, AppError>;
};

export type MaterialProcessingProcessor = (
  jobData: MaterialProcessingJobData,
  updateProgress: (
    step: MaterialProcessingProgress["step"],
    progress: number,
    message?: string,
  ) => Promise<void>,
) => ResultAsync<MaterialProcessingJobResult, AppError>;
