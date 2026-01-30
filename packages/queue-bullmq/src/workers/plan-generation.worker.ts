import { Worker } from "bullmq";
import { toThrowable } from "@repo/core/common/result";

import { PLAN_GENERATION_QUEUE_NAME } from "../queues/plan-generation.queue";

import type { Job, Processor, WorkerOptions } from "bullmq";
import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
  PlanGenerationProcessor,
  PlanGenerationProgress,
} from "@repo/core/modules/plan";

export type PlanGenerationWorkerDeps = {
  readonly processPlanGeneration: PlanGenerationProcessor;
};

export function createPlanGenerationWorker(
  deps: PlanGenerationWorkerDeps,
  options: Omit<WorkerOptions, "concurrency"> & {
    readonly concurrency?: number;
  },
): Worker<PlanGenerationJobData, PlanGenerationJobResult> {
  const processor: Processor<
    PlanGenerationJobData,
    PlanGenerationJobResult
  > = async (job: Job<PlanGenerationJobData>) => {
    const updateProgress = async (
      step: PlanGenerationProgress["step"],
      progress: number,
      message?: string,
    ): Promise<void> => {
      await job.updateProgress({ step, progress, message });
    };

    const result = await deps.processPlanGeneration(job.data, updateProgress);

    if (result.isErr()) {
      throw toThrowable(result.error);
    }

    return result.value;
  };

  return new Worker<PlanGenerationJobData, PlanGenerationJobResult>(
    PLAN_GENERATION_QUEUE_NAME,
    processor,
    {
      ...options,
      concurrency: options.concurrency ?? 2,
    },
  );
}
