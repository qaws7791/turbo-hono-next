import {
  MATERIAL_PROCESSING_QUEUE_NAME,
  createMaterialProcessingQueue,
} from "./queues/material-processing.queue";
import {
  PLAN_GENERATION_QUEUE_NAME,
  createPlanGenerationQueue,
} from "./queues/plan-generation.queue";

import type { Worker } from "bullmq";
import type { MaterialProcessingQueue } from "./queues/material-processing.queue";
import type { PlanGenerationQueue } from "./queues/plan-generation.queue";

/**
 * Queue 레지스트리
 *
 * 모든 Queue와 Worker를 중앙에서 관리합니다.
 */
export type QueueRegistry = {
  readonly queues: {
    readonly materialProcessing: MaterialProcessingQueue;
    readonly planGeneration: PlanGenerationQueue;
  };
  readonly workers: Array<Worker>;
  readonly registerWorker: (worker: Worker) => void;
  readonly shutdown: () => Promise<void>;
};

let registry: QueueRegistry | null = null;

/**
 * Queue 레지스트리 초기화
 */
export function initializeQueueRegistry(): QueueRegistry {
  if (registry) {
    return registry;
  }

  const materialProcessingQueue = createMaterialProcessingQueue();
  const planGenerationQueue = createPlanGenerationQueue();

  const workers: Array<Worker> = [];

  registry = {
    queues: {
      materialProcessing: materialProcessingQueue,
      planGeneration: planGenerationQueue,
    },
    workers,
    registerWorker: (worker: Worker) => {
      workers.push(worker);
    },
    shutdown: async () => {
      // 모든 Worker 종료
      await Promise.all(workers.map((worker) => worker.close()));

      // 모든 Queue 종료
      await Promise.all([
        materialProcessingQueue.close(),
        planGenerationQueue.close(),
      ]);

      registry = null;
    },
  };

  return registry;
}

/**
 * Queue 레지스트리 가져오기
 */
export function getQueueRegistry(): QueueRegistry {
  if (!registry) {
    throw new Error(
      "Queue 레지스트리가 초기화되지 않았습니다. initializeQueueRegistry()를 먼저 호출하세요.",
    );
  }
  return registry;
}

/**
 * Queue 이름 상수 내보내기
 */
export { MATERIAL_PROCESSING_QUEUE_NAME, PLAN_GENERATION_QUEUE_NAME };
