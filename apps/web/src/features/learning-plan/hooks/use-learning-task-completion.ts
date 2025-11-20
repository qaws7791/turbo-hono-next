import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { LearningModule } from "@/features/learning-plan/model/types";

import { updateLearningTask } from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";
import {
  calculateModuleCompletion,
  prepareOptimisticUpdate,
  rollbackOptimisticUpdate,
  updateLearningModuleInCache,
} from "@/shared/utils/optimistic-updates";

interface UseLearningTaskCompletionParams {
  learningPlanId: string;
  learningModule: LearningModule;
}

/**
 * 학습 태스크 완료/미완료 상태를 관리하는 hook
 * 태스크 완료 시 모듈의 완료율도 자동으로 재계산합니다.
 */
export function useLearningTaskCompletion({
  learningPlanId,
  learningModule,
}: UseLearningTaskCompletionParams) {
  const queryClient = useQueryClient();
  const learningPlanQueryKey = learningPlanKeys.detail(learningPlanId);

  const toggleLearningTaskCompleteMutation = useMutation({
    mutationFn: ({
      learningTaskId,
      isCompleted,
    }: {
      learningTaskId: string;
      isCompleted: boolean;
    }) =>
      updateLearningTask(learningTaskId, {
        isCompleted,
      }),
    onMutate: async ({ learningTaskId, isCompleted }) => {
      const previousData = await prepareOptimisticUpdate(
        queryClient,
        learningPlanQueryKey,
      );

      const optimisticCompletedAt = isCompleted
        ? new Date().toISOString()
        : null;

      updateLearningModuleInCache(
        queryClient,
        learningPlanQueryKey,
        learningModule.id,
        (existingModule) => {
          const updatedLearningTasks = existingModule.learningTasks.map(
            (learningTask) =>
              learningTask.id === learningTaskId
                ? {
                    ...learningTask,
                    isCompleted,
                    completedAt: optimisticCompletedAt,
                  }
                : learningTask,
          );

          const moduleCompletion = calculateModuleCompletion({
            ...existingModule,
            learningTasks: updatedLearningTasks,
          });

          return {
            ...existingModule,
            learningTasks: updatedLearningTasks,
            ...moduleCompletion,
          };
        },
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        learningPlanQueryKey,
        context?.previousData,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: learningPlanQueryKey,
      });
    },
  });

  const toggleLearningTaskCompletion = useCallback(
    (learningTaskId: string, isCompleted: boolean) => {
      if (toggleLearningTaskCompleteMutation.isPending) return;
      toggleLearningTaskCompleteMutation.mutate({
        learningTaskId,
        isCompleted,
      });
    },
    [toggleLearningTaskCompleteMutation],
  );

  return {
    toggleLearningTaskCompletion,
    isPending: toggleLearningTaskCompleteMutation.isPending,
  };
}
