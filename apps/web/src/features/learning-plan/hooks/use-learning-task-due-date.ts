import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import type { LearningModule } from "@/features/learning-plan/model/types";

import { updateLearningTask } from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";
import {
  prepareOptimisticUpdate,
  rollbackOptimisticUpdate,
  updateLearningModuleInCache,
} from "@/shared/utils/optimistic-updates";

interface UseLearningTaskDueDateParams {
  learningPlanId: string;
  learningModule: LearningModule;
}

/**
 * 학습 태스크 마감일을 관리하는 hook
 * 동시 업데이트 방지를 위한 상태 추적을 포함합니다.
 */
export function useLearningTaskDueDate({
  learningPlanId,
  learningModule,
}: UseLearningTaskDueDateParams) {
  const queryClient = useQueryClient();
  const learningPlanQueryKey = learningPlanKeys.detail(learningPlanId);
  const [updatingDueDateLearningTaskIds, setUpdatingDueDateLearningTaskIds] =
    useState<Set<string>>(() => new Set());

  const updateLearningTaskDueDateMutation = useMutation({
    mutationFn: ({
      learningTaskId,
      dueDate,
    }: {
      learningTaskId: string;
      dueDate: string | null;
    }) =>
      updateLearningTask(learningTaskId, {
        dueDate,
      }),
    onMutate: async ({ learningTaskId, dueDate }) => {
      setUpdatingDueDateLearningTaskIds((previous) => {
        if (previous.has(learningTaskId)) return previous;
        const next = new Set(previous);
        next.add(learningTaskId);
        return next;
      });

      const previousData = await prepareOptimisticUpdate(
        queryClient,
        learningPlanQueryKey,
      );

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
                    dueDate,
                  }
                : learningTask,
          );

          return {
            ...existingModule,
            learningTasks: updatedLearningTasks,
          };
        },
      );

      return { previousData, learningTaskId };
    },
    onError: (_error, _variables, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        learningPlanQueryKey,
        context?.previousData,
      );

      if (context?.learningTaskId) {
        setUpdatingDueDateLearningTaskIds((previous) => {
          if (!previous.has(context.learningTaskId)) return previous;
          const next = new Set(previous);
          next.delete(context.learningTaskId);
          return next;
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.learningTaskId) {
        setUpdatingDueDateLearningTaskIds((previous) => {
          if (!previous.has(variables.learningTaskId)) return previous;
          const next = new Set(previous);
          next.delete(variables.learningTaskId);
          return next;
        });
      }

      queryClient.invalidateQueries({
        queryKey: learningPlanQueryKey,
      });
    },
  });

  const updateLearningTaskDueDate = useCallback(
    (learningTaskId: string, dueDate: string | null) => {
      if (updatingDueDateLearningTaskIds.has(learningTaskId)) {
        return;
      }
      updateLearningTaskDueDateMutation.mutate({ learningTaskId, dueDate });
    },
    [updateLearningTaskDueDateMutation, updatingDueDateLearningTaskIds],
  );

  return {
    updateLearningTaskDueDate,
    updatingDueDateLearningTaskIds,
  };
}
