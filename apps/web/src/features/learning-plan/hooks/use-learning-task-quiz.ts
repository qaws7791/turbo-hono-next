import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  generateLearningTaskQuiz,
  submitLearningTaskQuiz,
} from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

interface SubmitQuizVariables {
  quizId: string;
  answers: Array<{ questionId: string; selectedIndex: number }>;
}

interface UseLearningTaskQuizParams {
  learningPlanId: string;
  learningTaskId: string;
}

export function useLearningTaskQuiz({
  learningPlanId,
  learningTaskId,
}: UseLearningTaskQuizParams) {
  const queryClient = useQueryClient();

  const {
    mutateAsync: generateQuizMutation,
    isPending: isGeneratePending,
    error: generateQuizError,
  } = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      generateLearningTaskQuiz(learningPlanId, learningTaskId, options),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTask(learningPlanId, learningTaskId),
      });
    },
  });

  const {
    mutateAsync: submitQuizMutation,
    isPending: isSubmitPending,
    error: submitQuizError,
  } = useMutation({
    mutationFn: ({ quizId, answers }: SubmitQuizVariables) =>
      submitLearningTaskQuiz(learningPlanId, learningTaskId, quizId, answers),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTask(learningPlanId, learningTaskId),
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
