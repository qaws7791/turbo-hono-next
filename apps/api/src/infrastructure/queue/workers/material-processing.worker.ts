/**
 * Material Processing Worker
 *
 * 이 파일은 Worker 인터페이스만 정의합니다.
 * 실제 작업 로직은 MaterialService의 의존성으로 주입받습니다.
 *
 * Worker에서 직접 modules를 import하면 린트 에러가 발생하므로,
 * 의존성 주입 패턴을 사용합니다.
 */
import { Worker } from "bullmq";

import { toThrowable } from "../../../lib/result";
import { QUEUE_CONCURRENCY, getConnectionOptions } from "../queue.config";
import { MATERIAL_PROCESSING_QUEUE_NAME } from "../queues/material-processing.queue";

import type { Job, Processor } from "bullmq";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
  MaterialProcessingProgress,
} from "../queues/material-processing.queue";

/**
 * Material 처리 작업 함수 타입
 */
export type MaterialProcessingProcessor = (
  jobData: MaterialProcessingJobData,
  updateProgress: (
    step: MaterialProcessingProgress["step"],
    progress: number,
    message?: string,
  ) => Promise<void>,
) => ResultAsync<MaterialProcessingJobResult, AppError>;

export type MaterialProcessingWorkerDeps = {
  readonly processMaterialUpload: MaterialProcessingProcessor;
};

/**
 * Material 처리 Worker 생성
 */
export function createMaterialProcessingWorker(
  deps: MaterialProcessingWorkerDeps,
): Worker<MaterialProcessingJobData, MaterialProcessingJobResult> {
  const processor: Processor<
    MaterialProcessingJobData,
    MaterialProcessingJobResult
  > = async (job: Job<MaterialProcessingJobData>) => {
    const updateProgress = async (
      step: MaterialProcessingProgress["step"],
      progress: number,
      message?: string,
    ): Promise<void> => {
      await job.updateProgress({ step, progress, message });
    };

    const result = await deps.processMaterialUpload(job.data, updateProgress);

    if (result.isErr()) {
      throw toThrowable(result.error);
    }

    return result.value;
  };

  return new Worker<MaterialProcessingJobData, MaterialProcessingJobResult>(
    MATERIAL_PROCESSING_QUEUE_NAME,
    processor,
    {
      connection: getConnectionOptions(),
      concurrency: QUEUE_CONCURRENCY,
    },
  );
}
