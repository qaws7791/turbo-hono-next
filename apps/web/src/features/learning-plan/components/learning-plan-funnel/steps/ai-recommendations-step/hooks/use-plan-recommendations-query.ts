import { useQuery } from "@tanstack/react-query";

import { getPlanRecommendations } from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

interface UsePlanRecommendationsQueryParams {
  documentId: string;
  learningTopic: string;
  mainGoal: string;
}

export const usePlanRecommendationsQuery = (
  params: UsePlanRecommendationsQueryParams,
) => {
  return useQuery({
    queryKey: learningPlanKeys.recommendations(params),
    queryFn: async () => {
      const response = await getPlanRecommendations({
        documentId: params.documentId,
        learningTopic: params.learningTopic,
        mainGoal: params.mainGoal,
      });

      if (response.error) {
        throw new Error("AI 추천을 가져오는데 실패했습니다");
      }

      if (!response.data) {
        throw new Error("추천 데이터가 없습니다");
      }

      return response.data;
    },
  });
};
