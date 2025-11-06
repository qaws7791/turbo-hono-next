import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import type { LearningModule } from "@/features/learning-plan/model/types";

import {
  updateLearningModule,
  updateLearningTask,
} from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

interface UseLearningModuleItemParams {
  learningPlanId: string;
  learningModule: LearningModule;
}

export function useLearningModuleItem({
  learningPlanId,
  learningModule,
}: UseLearningModuleItemParams) {
  const queryClient = useQueryClient();
  const learningPlanQueryKey = learningPlanKeys.detail(learningPlanId);
  const [updatingDueDateLearningTaskIds, setUpdatingDueDateLearningTaskIds] =
    useState<Set<string>>(() => new Set());

  const toggleExpansionMutation = useMutation({
    mutationFn: (newIsExpanded: boolean) =>
      updateLearningModule(learningModule.id, {
        isExpanded: newIsExpanded,
      }),
    onMutate: async (newIsExpanded: boolean) => {
      await queryClient.cancelQueries({
        queryKey: learningPlanQueryKey,
      });

      const previousData = queryClient.getQueryData(learningPlanQueryKey);

      queryClient.setQueryData(learningPlanQueryKey, (old) => {
        const current = old as
          | { data?: { learningModules: Array<LearningModule> } }
          | undefined;
        const learningPlan = current?.data;
        if (!learningPlan) return old;

        return {
          ...current,
          data: {
            ...learningPlan,
            learningModules: learningPlan.learningModules.map(
              (existingLearningModule) =>
                existingLearningModule.id === learningModule.id
                  ? { ...existingLearningModule, isExpanded: newIsExpanded }
                  : existingLearningModule,
            ),
          },
        };
      });

      return { previousData };
    },
    onError: (_error, _newIsExpanded, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(learningPlanQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: learningPlanQueryKey,
      });
    },
  });

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
      await queryClient.cancelQueries({
        queryKey: learningPlanQueryKey,
      });

      const previousData = queryClient.getQueryData(learningPlanQueryKey);

      queryClient.setQueryData(learningPlanQueryKey, (old) => {
        const current = old as
          | { data?: { learningModules: Array<LearningModule> } }
          | undefined;
        const learningPlan = current?.data;
        if (!learningPlan) return old;

        const optimisticCompletedAt = isCompleted
          ? new Date().toISOString()
          : null;

        return {
          ...current,
          data: {
            ...learningPlan,
            learningModules: learningPlan.learningModules.map(
              (existingLearningModule) => {
                if (existingLearningModule.id !== learningModule.id) {
                  return existingLearningModule;
                }

                const updatedLearningTasks =
                  existingLearningModule.learningTasks.map((learningTask) =>
                    learningTask.id === learningTaskId
                      ? {
                          ...learningTask,
                          isCompleted,
                          completedAt: optimisticCompletedAt,
                        }
                      : learningTask,
                  );

                const completedLearningTasks = updatedLearningTasks.filter(
                  (learningTask) => learningTask.isCompleted,
                ).length;
                const hasLearningTasks = updatedLearningTasks.length > 0;
                const learningModuleIsCompleted = hasLearningTasks
                  ? completedLearningTasks === updatedLearningTasks.length
                  : false;

                return {
                  ...existingLearningModule,
                  learningTasks: updatedLearningTasks,
                  completedLearningTasks,
                  hasLearningTasks,
                  isCompleted: learningModuleIsCompleted,
                };
              },
            ),
          },
        };
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(learningPlanQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: learningPlanQueryKey,
      });
    },
  });

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

      await queryClient.cancelQueries({
        queryKey: learningPlanQueryKey,
      });

      const previousData = queryClient.getQueryData(learningPlanQueryKey);

      queryClient.setQueryData(learningPlanQueryKey, (old) => {
        const current = old as
          | { data?: { learningModules: Array<LearningModule> } }
          | undefined;
        const learningPlan = current?.data;
        if (!learningPlan) return old;

        return {
          ...current,
          data: {
            ...learningPlan,
            learningModules: learningPlan.learningModules.map(
              (existingLearningModule) => {
                if (existingLearningModule.id !== learningModule.id) {
                  return existingLearningModule;
                }

                const updatedLearningTasks =
                  existingLearningModule.learningTasks.map((learningTask) =>
                    learningTask.id === learningTaskId
                      ? {
                          ...learningTask,
                          dueDate,
                        }
                      : learningTask,
                  );

                return {
                  ...existingLearningModule,
                  learningTasks: updatedLearningTasks,
                };
              },
            ),
          },
        };
      });

      return { previousData, learningTaskId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(learningPlanQueryKey, context.previousData);
      }
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

  const handleToggleExpansion = useCallback(() => {
    if (toggleExpansionMutation.isPending) return;
    toggleExpansionMutation.mutate(!learningModule.isExpanded);
  }, [learningModule.isExpanded, toggleExpansionMutation]);

  const handleToggleLearningTaskComplete = useCallback(
    (learningTaskId: string, isCompleted: boolean) => {
      if (toggleLearningTaskCompleteMutation.isPending) return;
      toggleLearningTaskCompleteMutation.mutate({
        learningTaskId,
        isCompleted,
      });
    },
    [toggleLearningTaskCompleteMutation],
  );

  const handleUpdateLearningTaskDueDate = useCallback(
    (learningTaskId: string, dueDate: string | null) => {
      if (updatingDueDateLearningTaskIds.has(learningTaskId)) {
        return;
      }
      updateLearningTaskDueDateMutation.mutate({ learningTaskId, dueDate });
    },
    [updateLearningTaskDueDateMutation, updatingDueDateLearningTaskIds],
  );

  return {
    isTogglingLearningModule: toggleExpansionMutation.isPending,
    updatingDueDateLearningTaskIds,
    toggleExpansion: handleToggleExpansion,
    toggleLearningTaskCompletion: handleToggleLearningTaskComplete,
    updateLearningTaskDueDate: handleUpdateLearningTaskDueDate,
  };
}
