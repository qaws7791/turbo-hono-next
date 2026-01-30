export { getConnectionOptions } from "./connection";
export { defaultJobOptions } from "./default-job-options";

export {
  MATERIAL_PROCESSING_QUEUE_NAME,
  createMaterialProcessingQueue,
} from "./queues/material-processing.queue";
export type { MaterialProcessingQueue } from "./queues/material-processing.queue";

export {
  PLAN_GENERATION_QUEUE_NAME,
  createPlanGenerationQueue,
} from "./queues/plan-generation.queue";
export type { PlanGenerationQueue } from "./queues/plan-generation.queue";

export { createQueueRegistry } from "./registry";
export type { QueueRegistry } from "./registry";

export {
  createMaterialProcessingQueuePort,
  createPlanGenerationQueuePort,
} from "./ports";

export { createMaterialProcessingWorker } from "./workers/material-processing.worker";
export type { MaterialProcessingWorkerDeps } from "./workers/material-processing.worker";

export { createPlanGenerationWorker } from "./workers/plan-generation.worker";
export type { PlanGenerationWorkerDeps } from "./workers/plan-generation.worker";
