import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { LearningModule } from "@/features/learning-plan/model/types";

/**
 * Learning Plan 쿼리 데이터 구조
 */
type LearningPlanQueryData = {
  data?: {
    learningModules: Array<LearningModule>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * Optimistic update를 위한 공통 헬퍼 함수
 * TanStack Query의 반복적인 캐시 업데이트 패턴을 추상화합니다.
 */

/**
 * 쿼리 취소 및 이전 데이터 가져오기
 */
export async function prepareOptimisticUpdate<T = unknown>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): Promise<T | undefined> {
  await queryClient.cancelQueries({ queryKey });
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Learning Module 배열을 업데이트하는 공통 로직
 * 특정 모듈 ID에 대해 updater 함수를 적용합니다.
 */
export function updateLearningModuleInCache(
  queryClient: QueryClient,
  queryKey: QueryKey,
  moduleId: string,
  updater: (module: LearningModule) => LearningModule,
): void {
  queryClient.setQueryData(queryKey, (old) => {
    const current = old as LearningPlanQueryData | undefined;
    const learningPlan = current?.data;
    if (!learningPlan) return old;

    return {
      ...current,
      data: {
        ...learningPlan,
        learningModules: learningPlan.learningModules.map(
          (existingLearningModule) =>
            existingLearningModule.id === moduleId
              ? updater(existingLearningModule)
              : existingLearningModule,
        ),
      },
    };
  });
}

/**
 * Learning Task 완료 상태 계산
 * 모듈의 완료율과 완료 여부를 자동으로 계산합니다.
 */
export function calculateModuleCompletion(
  module: LearningModule,
): Pick<
  LearningModule,
  "completedLearningTasks" | "hasLearningTasks" | "isCompleted"
> {
  const completedLearningTasks = module.learningTasks.filter(
    (task) => task.isCompleted,
  ).length;
  const hasLearningTasks = module.learningTasks.length > 0;
  const isCompleted = hasLearningTasks
    ? completedLearningTasks === module.learningTasks.length
    : false;

  return {
    completedLearningTasks,
    hasLearningTasks,
    isCompleted,
  };
}

/**
 * Mutation 실패 시 이전 데이터로 롤백
 */
export function rollbackOptimisticUpdate<T = unknown>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  previousData: T | undefined,
): void {
  if (previousData) {
    queryClient.setQueryData(queryKey, previousData);
  }
}
