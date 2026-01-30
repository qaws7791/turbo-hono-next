import { Queue } from "bullmq";

import { defaultJobOptions } from "../default-job-options";

import type { ConnectionOptions, DefaultJobOptions } from "bullmq";
import type {
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
} from "@repo/core/modules/material";

export const MATERIAL_PROCESSING_QUEUE_NAME = "material-processing";

export type MaterialProcessingQueue = Queue<
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
  string
>;

export function createMaterialProcessingQueue(options: {
  readonly connection: ConnectionOptions;
  readonly defaultJobOptions?: DefaultJobOptions;
}): MaterialProcessingQueue {
  return new Queue<
    MaterialProcessingJobData,
    MaterialProcessingJobResult,
    string
  >(MATERIAL_PROCESSING_QUEUE_NAME, {
    connection: options.connection,
    defaultJobOptions: options.defaultJobOptions ?? defaultJobOptions,
  });
}
