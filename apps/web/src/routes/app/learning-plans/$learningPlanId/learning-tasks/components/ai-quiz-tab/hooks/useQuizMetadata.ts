import { useMemo } from "react";

import type {
  LearningTaskQuiz,
  LearningTaskQuizStatus,
} from "@/features/learning-plan/model/types";

type UseQuizMetadataParams = {
  quizData: LearningTaskQuiz | undefined;
  selectedAnswers: Record<string, number>;
  isGeneratePending: boolean;
  isSubmitPending: boolean;
};

export function useQuizMetadata({
  quizData,
  selectedAnswers,
  isGeneratePending,
  isSubmitPending,
}: UseQuizMetadataParams) {
  const quizStatus: LearningTaskQuizStatus = quizData?.status ?? "idle";
  const quizQuestions = quizData?.questions ?? [];
  const latestQuizResult = quizData?.latestResult ?? null;
  const isQuizProcessing = quizStatus === "processing" || isGeneratePending;

  const answeredCount = useMemo(
    () =>
      quizQuestions.reduce((count, question) => {
        return selectedAnswers[question.id] !== undefined ? count + 1 : count;
      }, 0),
    [quizQuestions, selectedAnswers],
  );

  const allQuestionsAnswered = useMemo(
    () =>
      quizQuestions.length > 0 &&
      quizQuestions.every(
        (question) => selectedAnswers[question.id] !== undefined,
      ),
    [quizQuestions, selectedAnswers],
  );

  const canSubmitQuiz = useMemo(
    () =>
      Boolean(
        quizData &&
          quizStatus === "ready" &&
          quizQuestions.length > 0 &&
          !latestQuizResult &&
          allQuestionsAnswered,
      ) && !isSubmitPending,
    [
      quizData,
      quizStatus,
      quizQuestions.length,
      latestQuizResult,
      allQuestionsAnswered,
      isSubmitPending,
    ],
  );

  const isQuizOptionDisabled = useMemo(
    () =>
      quizStatus !== "ready" ||
      Boolean(latestQuizResult) ||
      isQuizProcessing ||
      isSubmitPending,
    [quizStatus, latestQuizResult, isQuizProcessing, isSubmitPending],
  );

  return {
    quizStatus,
    quizQuestions,
    latestQuizResult,
    isQuizProcessing,
    answeredCount,
    allQuestionsAnswered,
    canSubmitQuiz,
    isQuizOptionDisabled,
  };
}
