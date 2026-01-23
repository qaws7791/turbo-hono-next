import { Queue } from "bullmq";

import { defaultJobOptions, getConnectionOptions } from "../queue.config";

/**
 * Material 처리 작업 데이터
 */
export type MaterialProcessingJobData = {
  readonly userId: string;
  readonly uploadId: string;
  readonly title: string;
  readonly etag?: string;
};

/**
 * Material 처리 작업 결과
 */
export type MaterialProcessingJobResult = {
  readonly materialId: string;
  readonly title: string;
  readonly summary: string | null;
  readonly processingStatus: "READY" | "FAILED";
};

/**
 * Material 처리 진행 상황
 */
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

export const MATERIAL_PROCESSING_QUEUE_NAME = "material-processing";

export type MaterialProcessingQueue = Queue<
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
  string,
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
  string
>;

/**
 * Material 처리 Queue 생성
 */
export function createMaterialProcessingQueue(): MaterialProcessingQueue {
  return new Queue<
    MaterialProcessingJobData,
    MaterialProcessingJobResult,
    string,
    MaterialProcessingJobData,
    MaterialProcessingJobResult,
    string
  >(MATERIAL_PROCESSING_QUEUE_NAME, {
    connection: getConnectionOptions(),
    defaultJobOptions,
  });
}
