import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Goal } from "@/domains/roadmap/model/types";

import { api } from "@/api/http-client";


interface UseGoalItemParams {
  roadmapId: string;
  goal: Goal;
}

const ROADMAP_QUERY_KEY_PREFIX = "roadmap" as const;

export function useGoalItem({ roadmapId, goal }: UseGoalItemParams) {
  const queryClient = useQueryClient();
  const roadmapQueryKey = [ROADMAP_QUERY_KEY_PREFIX, roadmapId] as const;
  const [updatingDueDateSubGoalIds, setUpdatingDueDateSubGoalIds] = useState<
    Set<string>
  >(() => new Set());

  const toggleExpansionMutation = useMutation({
    mutationFn: (newIsExpanded: boolean) =>
      api.goals.update(roadmapId, goal.id, {
        isExpanded: newIsExpanded,
      }),
    onMutate: async (newIsExpanded: boolean) => {
      await queryClient.cancelQueries({
        queryKey: roadmapQueryKey,
      });

      const previousData = queryClient.getQueryData(roadmapQueryKey);

      queryClient.setQueryData(roadmapQueryKey, (old) => {
        const current = old as { data?: { goals: Array<Goal> } } | undefined;
        const roadmap = current?.data;
        if (!roadmap) return old;

        return {
          ...current,
          data: {
            ...roadmap,
            goals: roadmap.goals.map((existingGoal) =>
              existingGoal.id === goal.id
                ? { ...existingGoal, isExpanded: newIsExpanded }
                : existingGoal,
            ),
          },
        };
      });

      return { previousData };
    },
    onError: (_error, _newIsExpanded, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(roadmapQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: roadmapQueryKey,
      });
    },
  });

  const toggleSubGoalCompleteMutation = useMutation({
    mutationFn: ({
      subGoalId,
      isCompleted,
    }: {
      subGoalId: string;
      isCompleted: boolean;
    }) =>
      api.subGoals.update(roadmapId, subGoalId, {
        isCompleted,
      }),
    onMutate: async ({ subGoalId, isCompleted }) => {
      await queryClient.cancelQueries({
        queryKey: roadmapQueryKey,
      });

      const previousData = queryClient.getQueryData(roadmapQueryKey);

      queryClient.setQueryData(roadmapQueryKey, (old) => {
        const current = old as { data?: { goals: Array<Goal> } } | undefined;
        const roadmap = current?.data;
        if (!roadmap) return old;

        const optimisticCompletedAt = isCompleted
          ? new Date().toISOString()
          : null;

        return {
          ...current,
          data: {
            ...roadmap,
            goals: roadmap.goals.map((existingGoal) => {
              if (existingGoal.id !== goal.id) {
                return existingGoal;
              }

              const updatedSubGoals = existingGoal.subGoals.map((subGoal) =>
                subGoal.id === subGoalId
                  ? {
                      ...subGoal,
                      isCompleted,
                      completedAt: optimisticCompletedAt,
                    }
                  : subGoal,
              );

              const completedSubGoals = updatedSubGoals.filter(
                (subGoal) => subGoal.isCompleted,
              ).length;
              const hasSubGoals = updatedSubGoals.length > 0;
              const goalIsCompleted = hasSubGoals
                ? completedSubGoals === updatedSubGoals.length
                : false;

              return {
                ...existingGoal,
                subGoals: updatedSubGoals,
                completedSubGoals,
                hasSubGoals,
                isCompleted: goalIsCompleted,
              };
            }),
          },
        };
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(roadmapQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: roadmapQueryKey,
      });
    },
  });

  const updateSubGoalDueDateMutation = useMutation({
    mutationFn: ({
      subGoalId,
      dueDate,
    }: {
      subGoalId: string;
      dueDate: string | null;
    }) =>
      api.subGoals.update(roadmapId, subGoalId, {
        dueDate,
      }),
    onMutate: async ({ subGoalId, dueDate }) => {
      setUpdatingDueDateSubGoalIds((previous) => {
        if (previous.has(subGoalId)) return previous;
        const next = new Set(previous);
        next.add(subGoalId);
        return next;
      });

      await queryClient.cancelQueries({
        queryKey: roadmapQueryKey,
      });

      const previousData = queryClient.getQueryData(roadmapQueryKey);

      queryClient.setQueryData(roadmapQueryKey, (old) => {
        const current = old as { data?: { goals: Array<Goal> } } | undefined;
        const roadmap = current?.data;
        if (!roadmap) return old;

        return {
          ...current,
          data: {
            ...roadmap,
            goals: roadmap.goals.map((existingGoal) => {
              if (existingGoal.id !== goal.id) {
                return existingGoal;
              }

              const updatedSubGoals = existingGoal.subGoals.map((subGoal) =>
                subGoal.id === subGoalId
                  ? {
                      ...subGoal,
                      dueDate,
                    }
                  : subGoal,
              );

              return {
                ...existingGoal,
                subGoals: updatedSubGoals,
              };
            }),
          },
        };
      });

      return { previousData, subGoalId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(roadmapQueryKey, context.previousData);
      }
      if (context?.subGoalId) {
        setUpdatingDueDateSubGoalIds((previous) => {
          if (!previous.has(context.subGoalId)) return previous;
          const next = new Set(previous);
          next.delete(context.subGoalId);
          return next;
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.subGoalId) {
        setUpdatingDueDateSubGoalIds((previous) => {
          if (!previous.has(variables.subGoalId)) return previous;
          const next = new Set(previous);
          next.delete(variables.subGoalId);
          return next;
        });
      }
      queryClient.invalidateQueries({
        queryKey: roadmapQueryKey,
      });
    },
  });

  const handleToggleExpansion = useCallback(() => {
    if (toggleExpansionMutation.isPending) return;
    toggleExpansionMutation.mutate(!goal.isExpanded);
  }, [goal.isExpanded, toggleExpansionMutation]);

  const handleToggleSubGoalComplete = useCallback(
    (subGoalId: string, isCompleted: boolean) => {
      if (toggleSubGoalCompleteMutation.isPending) return;
      toggleSubGoalCompleteMutation.mutate({ subGoalId, isCompleted });
    },
    [toggleSubGoalCompleteMutation],
  );

  const handleUpdateSubGoalDueDate = useCallback(
    (subGoalId: string, dueDate: string | null) => {
      if (updatingDueDateSubGoalIds.has(subGoalId)) {
        return;
      }
      updateSubGoalDueDateMutation.mutate({ subGoalId, dueDate });
    },
    [updateSubGoalDueDateMutation, updatingDueDateSubGoalIds],
  );

  return {
    isTogglingGoal: toggleExpansionMutation.isPending,
    updatingDueDateSubGoalIds,
    toggleExpansion: handleToggleExpansion,
    toggleSubGoalCompletion: handleToggleSubGoalComplete,
    updateSubGoalDueDate: handleUpdateSubGoalDueDate,
  };
}
