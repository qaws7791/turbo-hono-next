/**
 * Plan Generation Worker
 *
 * 이 파일은 Worker 인터페이스만 정의합니다.
 * 실제 작업 로직은 PlanService의 의존성으로 주입받습니다.
 *
 * Worker에서 직접 modules를 import하면 린트 에러가 발생하므로,
 * 의존성 주입 패턴을 사용합니다.
 */
import { Worker } from "bullmq";

import { toThrowable } from "../../../lib/result";
import { getConnectionOptions } from "../queue.config";
import { PLAN_GENERATION_QUEUE_NAME } from "../queues/plan-generation.queue";

import type { Job, Processor } from "bullmq";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
  PlanGenerationProgress,
} from "../queues/plan-generation.queue";

/**
 * Plan 생성 작업 처리 함수 타입
 */
export type PlanGenerationProcessor = (
  jobData: PlanGenerationJobData,
  updateProgress: (
    step: PlanGenerationProgress["step"],
    progress: number,
    message?: string,
  ) => Promise<void>,
) => ResultAsync<PlanGenerationJobResult, AppError>;

export type PlanGenerationWorkerDeps = {
  readonly processPlanGeneration: PlanGenerationProcessor;
};

/**
 * Plan 생성 Worker 생성
 */
export function createPlanGenerationWorker(
  deps: PlanGenerationWorkerDeps,
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
      connection: getConnectionOptions(),
      concurrency: 1, // Plan 생성은 동시에 1개만 처리 (LLM 호출 비용 고려)
    },
  );
}
