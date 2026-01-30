import { createMaterialProcessingQueue } from "./queues/material-processing.queue";
import { createPlanGenerationQueue } from "./queues/plan-generation.queue";

import type { ConnectionOptions, DefaultJobOptions, Worker } from "bullmq";
import type { MaterialProcessingQueue } from "./queues/material-processing.queue";
import type { PlanGenerationQueue } from "./queues/plan-generation.queue";

export type QueueRegistry = {
  readonly queues: {
    readonly materialProcessing: MaterialProcessingQueue;
    readonly planGeneration: PlanGenerationQueue;
  };
  readonly workers: Array<Worker>;
  readonly registerWorker: (worker: Worker) => void;
  readonly shutdown: () => Promise<void>;
};

export function createQueueRegistry(options: {
  readonly connection: ConnectionOptions;
  readonly defaultJobOptions?: DefaultJobOptions;
}): QueueRegistry {
  const materialProcessingQueue = createMaterialProcessingQueue({
    connection: options.connection,
    defaultJobOptions: options.defaultJobOptions,
  });
  const planGenerationQueue = createPlanGenerationQueue({
    connection: options.connection,
    defaultJobOptions: options.defaultJobOptions,
  });

  const workers: Array<Worker> = [];

  return {
    queues: {
      materialProcessing: materialProcessingQueue,
      planGeneration: planGenerationQueue,
    },
    workers,
    registerWorker: (worker) => {
      workers.push(worker);
    },
    shutdown: async () => {
      await Promise.all(workers.map((worker) => worker.close()));
      await Promise.all([
        materialProcessingQueue.close(),
        planGenerationQueue.close(),
      ]);
    },
  };
}
