import { useCallback, useEffect, useState } from "react";

import type { LearningTaskQuiz } from "@/features/learning-plan/model/types";

type UseQuizAnswerSelectionParams = {
  quizData: LearningTaskQuiz | undefined;
};

export function useQuizAnswerSelection({
  quizData,
}: UseQuizAnswerSelectionParams) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!quizData) {
      setSelectedAnswers({});
      return;
    }

    if (quizData.latestResult) {
      const nextSelections = quizData.latestResult.answers.reduce<
        Record<string, number>
      >((accumulator, answer) => {
        accumulator[answer.id] = answer.selectedIndex;
        return accumulator;
      }, {});
      setSelectedAnswers(nextSelections);
      return;
    }

    setSelectedAnswers({});
  }, [quizData]);

  const handleSelectAnswer = useCallback(
    (questionId: string, optionIndex: number) => {
      setSelectedAnswers((previous) => ({
        ...previous,
        [questionId]: optionIndex,
      }));
    },
    [],
  );

  const resetAnswers = useCallback(() => {
    setSelectedAnswers({});
  }, []);

  return {
    selectedAnswers,
    setSelectedAnswers,
    handleSelectAnswer,
    resetAnswers,
  };
}
