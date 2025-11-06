import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  generateLearningTaskQuiz,
  submitLearningTaskQuiz,
} from "@/features/learning-plan/api/learning-plan-service";
import { learningTaskQuizQueryOptions } from "@/features/learning-plan/api/learning-plan-queries";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

const QUIZ_REFETCH_INTERVAL_MS = 4000;

interface SubmitQuizVariables {
  quizId: string;
  answers: Array<{ questionId: string; selectedIndex: number }>;
}

interface UseLearningTaskQuizParams {
  learningTaskId: string;
}

export function useLearningTaskQuiz({
  learningTaskId,
}: UseLearningTaskQuizParams) {
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    ...learningTaskQuizQueryOptions(learningTaskId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status ?? "idle";
      return status === "processing" ? QUIZ_REFETCH_INTERVAL_MS : false;
    },
  });

  const {
    mutateAsync: generateQuizMutation,
    isPending: isGeneratePending,
    error: generateQuizError,
  } = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      generateLearningTaskQuiz(learningTaskId, options),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTaskQuiz(learningTaskId),
      });
    },
  });

  const {
    mutateAsync: submitQuizMutation,
    isPending: isSubmitPending,
    error: submitQuizError,
  } = useMutation({
    mutationFn: ({ quizId, answers }: SubmitQuizVariables) =>
      submitLearningTaskQuiz(quizId, answers),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTaskQuiz(learningTaskId),
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
    quizData: quizQuery.data?.data,
    isLoading: quizQuery.isLoading,
    generateQuiz,
    isGeneratePending,
    generateErrorMessage,
    submitQuiz,
    isSubmitPending,
    submitErrorMessage,
  };
}
