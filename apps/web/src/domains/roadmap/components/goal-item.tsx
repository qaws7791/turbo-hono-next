import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { Goal } from "@/domains/roadmap/types";

import { roadmapQueryOptions } from "@/domains/roadmap/queries/roadmap-query-options";
import { SubGoalList } from "@/domains/roadmap/components/sub-goal-list";
import { api } from "@/api/http-client";

interface GoalItemProps {
  goal: Goal;
  roadmapId: string;
}

interface GoalInfoProps {
  goal: Goal;
  onToggleExpansion: () => void;
  isToggling?: boolean;
}

function GoalInfo({
  goal,
  onToggleExpansion,
  isToggling = false,
}: GoalInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {goal.isCompleted ? (
            <Icon
              name="solar--check-square-outline"
              type="iconify"
              className="h-5 w-5 text-green-600"
            />
          ) : (
            <Icon
              name="solar--stop-outline"
              type="iconify"
              className="h-5 w-5 text-muted-foreground"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`font-medium text-foreground ${goal.isCompleted ? "line-through opacity-75" : ""}`}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {goal.hasSubGoals && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon
                name="solar--list-outline"
                type="iconify"
                className="h-4 w-4"
              />
              <span>
                {goal.completedSubGoals}/{goal.subGoals.length} 완료
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.round((goal.completedSubGoals / goal.subGoals.length) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {Math.round(
                  (goal.completedSubGoals / goal.subGoals.length) * 100,
                )}
                %
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 ml-auto"
            onPress={onToggleExpansion}
            isDisabled={isToggling}
          >
            {goal.isExpanded ? (
              <>
                <Icon
                  name="solar--alt-arrow-up-outline"
                  type="iconify"
                  className="h-4 w-4 mr-1"
                />
                접기
              </>
            ) : (
              <>
                <Icon
                  name="solar--alt-arrow-down-outline"
                  type="iconify"
                  className="h-4 w-4 mr-1"
                />
                세부 목표 {goal.subGoals.length}개 보기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function GoalItem({ goal, roadmapId }: GoalItemProps) {
  const queryClient = useQueryClient();
  const [updatingDueDateSubGoalIds, setUpdatingDueDateSubGoalIds] = useState<
    Set<string>
  >(() => new Set<string>());

  const toggleExpansionMutation = useMutation({
    mutationFn: async (newIsExpanded: boolean) => {
      return api.goals.update(roadmapId, goal.id, {
        isExpanded: newIsExpanded,
      });
    },
    onMutate: async (newIsExpanded: boolean) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["roadmap", roadmapId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["roadmap", roadmapId]);
      console.log(newIsExpanded);
      // Optimistically update the goal expansion state
      queryClient.setQueryData(
        roadmapQueryOptions(roadmapId).queryKey,
        (old) => {
          const roadmap = old?.data;
          if (!roadmap) return old;
          console.log(roadmap);
          return {
            ...old,
            data: {
              ...roadmap,
              goals: roadmap.goals.map((g) =>
                g.id === goal.id ? { ...g, isExpanded: newIsExpanded } : g,
              ),
            },
          };
        },
      );

      return { previousData };
    },
    onError: (error, _newIsExpanded, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["roadmap", roadmapId], context.previousData);
      }
      console.error("Failed to toggle goal expansion:", error);
      // TODO: Show error toast notification
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["roadmap", roadmapId],
      });
    },
  });

  const toggleSubGoalCompleteMutation = useMutation({
    mutationFn: async ({
      subGoalId,
      isCompleted,
    }: {
      subGoalId: string;
      isCompleted: boolean;
    }) => {
      return api.subGoals.update(roadmapId, subGoalId, {
        isCompleted,
      });
    },
    onMutate: async ({ subGoalId, isCompleted }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["roadmap", roadmapId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["roadmap", roadmapId]);

      // Optimistically update the sub-goal completion state
      queryClient.setQueryData(
        roadmapQueryOptions(roadmapId).queryKey,
        (old) => {
          const roadmap = old?.data;
          if (!roadmap) return old;

          const optimisticCompletedAt = isCompleted
            ? new Date().toISOString()
            : null;

          return {
            ...old,
            data: {
              ...roadmap,
              goals: roadmap.goals.map((g) => {
                if (g.id === goal.id) {
                  const updatedSubGoals = g.subGoals.map((sg) =>
                    sg.id === subGoalId
                      ? {
                          ...sg,
                          isCompleted,
                          completedAt: optimisticCompletedAt,
                        }
                      : sg,
                  );

                  // Recalculate computed properties
                  const completedSubGoals = updatedSubGoals.filter(
                    (sg) => sg.isCompleted,
                  ).length;
                  const hasSubGoals = updatedSubGoals.length > 0;
                  const goalIsCompleted = hasSubGoals
                    ? completedSubGoals === updatedSubGoals.length
                    : false;

                  return {
                    ...g,
                    subGoals: updatedSubGoals,
                    completedSubGoals,
                    hasSubGoals,
                    isCompleted: goalIsCompleted,
                  };
                }
                return g;
              }),
            },
          };
        },
      );

      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["roadmap", roadmapId], context.previousData);
      }
      console.error("Failed to toggle sub-goal completion:", error);
      // TODO: Show error toast notification
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["roadmap", roadmapId],
      });
    },
  });

  const updateSubGoalDueDateMutation = useMutation({
    mutationFn: async ({
      subGoalId,
      dueDate,
    }: {
      subGoalId: string;
      dueDate: string | null;
    }) => {
      return api.subGoals.update(roadmapId, subGoalId, {
        dueDate,
      });
    },
    onMutate: async ({ subGoalId, dueDate }) => {
      setUpdatingDueDateSubGoalIds((previous) => {
        if (previous.has(subGoalId)) return previous;
        const next = new Set(previous);
        next.add(subGoalId);
        return next;
      });

      await queryClient.cancelQueries({
        queryKey: ["roadmap", roadmapId],
      });

      const previousData = queryClient.getQueryData(["roadmap", roadmapId]);

      queryClient.setQueryData(
        roadmapQueryOptions(roadmapId).queryKey,
        (old) => {
          const roadmap = old?.data;
          if (!roadmap) return old;

          return {
            ...old,
            data: {
              ...roadmap,
              goals: roadmap.goals.map((g) => {
                if (g.id === goal.id) {
                  const updatedSubGoals = g.subGoals.map((sg) =>
                    sg.id === subGoalId
                      ? {
                          ...sg,
                          dueDate,
                        }
                      : sg,
                  );

                  return {
                    ...g,
                    subGoals: updatedSubGoals,
                  };
                }
                return g;
              }),
            },
          };
        },
      );

      return { previousData, subGoalId };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["roadmap", roadmapId], context.previousData);
      }
      if (context?.subGoalId) {
        setUpdatingDueDateSubGoalIds((previous) => {
          if (!previous.has(context.subGoalId)) return previous;
          const next = new Set(previous);
          next.delete(context.subGoalId);
          return next;
        });
      }
      console.error("Failed to update sub-goal due date:", error);
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
        queryKey: ["roadmap", roadmapId],
      });
    },
  });

  const handleToggleExpansion = () => {
    if (toggleExpansionMutation.isPending) return;
    toggleExpansionMutation.mutate(!goal.isExpanded);
  };

  const handleToggleSubGoalComplete = (
    subGoalId: string,
    isCompleted: boolean,
  ) => {
    if (toggleSubGoalCompleteMutation.isPending) return;
    toggleSubGoalCompleteMutation.mutate({ subGoalId, isCompleted });
  };

  const handleUpdateSubGoalDueDate = (
    subGoalId: string,
    dueDate: string | null,
  ) => {
    if (updatingDueDateSubGoalIds.has(subGoalId)) {
      return;
    }
    updateSubGoalDueDateMutation.mutate({ subGoalId, dueDate });
  };

  return (
    <Card className="py-2 px-2">
      <div className="p-4 space-y-4">
        <GoalInfo
          goal={goal}
          onToggleExpansion={handleToggleExpansion}
          isToggling={toggleExpansionMutation.isPending}
        />

        {goal.isExpanded && goal.hasSubGoals && (
          <div className="border-t pt-4">
            <SubGoalList
              subGoals={goal.subGoals}
              goalId={goal.id}
              roadmapId={roadmapId}
              onToggleComplete={handleToggleSubGoalComplete}
              onUpdateDueDate={handleUpdateSubGoalDueDate}
              updatingDueDateSubGoalIds={updatingDueDateSubGoalIds}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export { GoalItem };
