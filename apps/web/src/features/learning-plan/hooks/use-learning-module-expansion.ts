import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { LearningModule } from "@/features/learning-plan/model/types";

import { updateLearningModule } from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";
import {
  prepareOptimisticUpdate,
  rollbackOptimisticUpdate,
  updateLearningModuleInCache,
} from "@/shared/utils/optimistic-updates";

interface UseLearningModuleExpansionParams {
  learningPlanId: string;
  learningModule: LearningModule;
}

/**
 * 학습 모듈 확장/축소 상태를 관리하는 hook
 * Optimistic update를 통해 즉각적인 UI 피드백을 제공합니다.
 */
export function useLearningModuleExpansion({
  learningPlanId,
  learningModule,
}: UseLearningModuleExpansionParams) {
  const queryClient = useQueryClient();
  const learningPlanQueryKey = learningPlanKeys.detail(learningPlanId);

  const toggleExpansionMutation = useMutation({
    mutationFn: (newIsExpanded: boolean) =>
      updateLearningModule(learningModule.id, {
        isExpanded: newIsExpanded,
      }),
    onMutate: async (newIsExpanded: boolean) => {
      const previousData = await prepareOptimisticUpdate(
        queryClient,
        learningPlanQueryKey,
      );

      updateLearningModuleInCache(
        queryClient,
        learningPlanQueryKey,
        learningModule.id,
        (existingModule) => ({
          ...existingModule,
          isExpanded: newIsExpanded,
        }),
      );

      return { previousData };
    },
    onError: (_error, _newIsExpanded, context) => {
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

  const toggleExpansion = useCallback(() => {
    if (toggleExpansionMutation.isPending) return;
    toggleExpansionMutation.mutate(!learningModule.isExpanded);
  }, [learningModule.isExpanded, toggleExpansionMutation]);

  return {
    toggleExpansion,
    isPending: toggleExpansionMutation.isPending,
  };
}
