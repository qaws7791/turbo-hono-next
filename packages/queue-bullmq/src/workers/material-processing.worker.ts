import { Worker } from "bullmq";
import { toThrowable } from "@repo/core/common/result";

import { MATERIAL_PROCESSING_QUEUE_NAME } from "../queues/material-processing.queue";

import type { Job, Processor, WorkerOptions } from "bullmq";
import type {
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
  MaterialProcessingProcessor,
  MaterialProcessingProgress,
} from "@repo/core/modules/material";

export type MaterialProcessingWorkerDeps = {
  readonly processMaterialUpload: MaterialProcessingProcessor;
};

export function createMaterialProcessingWorker(
  deps: MaterialProcessingWorkerDeps,
  options: Omit<WorkerOptions, "concurrency"> & {
    readonly concurrency?: number;
  },
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
      ...options,
      concurrency: options.concurrency ?? 2,
    },
  );
}
