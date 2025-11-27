import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLearningPlan } from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

export function useLearningPlanUpdate(learningPlanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateLearningPlan>[1]) =>
      updateLearningPlan(learningPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningPlanKeys.detail(learningPlanId),
      });
      queryClient.invalidateQueries({
        queryKey: learningPlanKeys.lists(),
      });
    },
  });
}
