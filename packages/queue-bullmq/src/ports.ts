import { ResultAsync } from "neverthrow";
import { coreError } from "@repo/core/common/core-error";

import type { AppError } from "@repo/core/common/result";
import type {
  MaterialProcessingJobData,
  MaterialProcessingQueuePort,
} from "@repo/core/modules/material";
import type { PlanGenerationQueuePort } from "@repo/core/modules/plan";
import type { MaterialProcessingQueue } from "./queues/material-processing.queue";
import type { PlanGenerationQueue } from "./queues/plan-generation.queue";

export function createMaterialProcessingQueuePort(
  queue: MaterialProcessingQueue,
): MaterialProcessingQueuePort {
  return {
    add: (name: string, data: MaterialProcessingJobData, options) =>
      ResultAsync.fromPromise(
        queue
          .add(name, data, options)
          .then((job) => ({ jobId: String(job.id) })),
        (cause): AppError =>
          coreError({
            code: "QUEUE_ADD_FAILED",
            message: "작업 큐 등록에 실패했습니다.",
            cause,
          }),
      ),
  };
}

export function createPlanGenerationQueuePort(
  queue: PlanGenerationQueue,
): PlanGenerationQueuePort {
  return {
    add: (name, data, options) =>
      ResultAsync.fromPromise(
        queue.add(name, data, options).then(() => undefined),
        (cause): AppError =>
          coreError({
            code: "QUEUE_ADD_FAILED",
            message: "작업 큐 등록에 실패했습니다.",
            cause,
          }),
      ),
  };
}
