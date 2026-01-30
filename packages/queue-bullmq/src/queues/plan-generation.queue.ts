import { Queue } from "bullmq";

import { defaultJobOptions } from "../default-job-options";

import type { ConnectionOptions, DefaultJobOptions } from "bullmq";
import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
} from "@repo/core/modules/plan";

export const PLAN_GENERATION_QUEUE_NAME = "plan-generation";

export type PlanGenerationQueue = Queue<
  PlanGenerationJobData,
  PlanGenerationJobResult,
  string
>;

export function createPlanGenerationQueue(options: {
  readonly connection: ConnectionOptions;
  readonly defaultJobOptions?: DefaultJobOptions;
}): PlanGenerationQueue {
  return new Queue<PlanGenerationJobData, PlanGenerationJobResult, string>(
    PLAN_GENERATION_QUEUE_NAME,
    {
      connection: options.connection,
      defaultJobOptions: options.defaultJobOptions ?? defaultJobOptions,
    },
  );
}
