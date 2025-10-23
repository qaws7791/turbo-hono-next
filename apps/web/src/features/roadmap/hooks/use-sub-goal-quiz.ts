import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  generateSubGoalQuiz,
  submitSubGoalQuiz,
} from "@/features/roadmap/api/roadmap-service";
import { roadmapKeys } from "@/features/roadmap/api/query-keys";

interface SubmitQuizVariables {
  quizId: string;
  answers: Array<{ questionId: string; selectedIndex: number }>;
}

interface UseSubGoalQuizParams {
  roadmapId: string;
  subGoalId: string;
}

export function useSubGoalQuiz({ roadmapId, subGoalId }: UseSubGoalQuizParams) {
  const queryClient = useQueryClient();

  const {
    mutateAsync: generateQuizMutation,
    isPending: isGeneratePending,
    error: generateQuizError,
  } = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      generateSubGoalQuiz(roadmapId, subGoalId, options),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roadmapKeys.subGoal(roadmapId, subGoalId),
      });
    },
  });

  const {
    mutateAsync: submitQuizMutation,
    isPending: isSubmitPending,
    error: submitQuizError,
  } = useMutation({
    mutationFn: ({ quizId, answers }: SubmitQuizVariables) =>
      submitSubGoalQuiz(roadmapId, subGoalId, quizId, answers),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roadmapKeys.subGoal(roadmapId, subGoalId),
      });
    },
  });

  const generateQuiz = useCallback(
    async (force?: boolean) => {
      return generateQuizMutation(force ? { force: true } : undefined);
    },
    [generateQuizMutation],
  );

  const submitQuiz = useCallback(
    async (variables: SubmitQuizVariables) => {
      return submitQuizMutation(variables);
    },
    [submitQuizMutation],
  );

  const generateErrorMessage =
    generateQuizError instanceof Error ? generateQuizError.message : null;
  const submitErrorMessage =
    submitQuizError instanceof Error ? submitQuizError.message : null;

  return {
    generateQuiz,
    isGeneratePending,
    generateErrorMessage,
    submitQuiz,
    isSubmitPending,
    submitErrorMessage,
  };
}
