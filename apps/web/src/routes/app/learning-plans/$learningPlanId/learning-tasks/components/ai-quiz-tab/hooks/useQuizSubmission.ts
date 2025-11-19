import { useCallback } from "react";

import type { LearningTaskQuiz } from "@/features/learning-plan/model/types";

type SubmitQuizParams = {
  quizId: string;
  answers: Array<{ questionId: string; selectedIndex: number }>;
};

type SubmitQuizResponse = {
  data?: {
    evaluation?: {
      answers: Array<{ id: string; selectedIndex: number }>;
    };
  };
};

type UseQuizSubmissionParams = {
  quizData: LearningTaskQuiz | undefined;
  selectedAnswers: Record<string, number>;
  canSubmitQuiz: boolean;
  submitQuiz: (params: SubmitQuizParams) => Promise<SubmitQuizResponse>;
  setSelectedAnswers: (answers: Record<string, number>) => void;
};

export function useQuizSubmission({
  quizData,
  selectedAnswers,
  canSubmitQuiz,
  submitQuiz,
  setSelectedAnswers,
}: UseQuizSubmissionParams) {
  const handleSubmitQuiz = useCallback(async () => {
    if (!quizData || !canSubmitQuiz || !quizData.questions) {
      return;
    }

    const answersPayload: Array<{
      questionId: string;
      selectedIndex: number;
    }> = [];

    for (const question of quizData.questions) {
      const selectedIndex = selectedAnswers[question.id];
      if (selectedIndex === undefined) {
        console.error("Missing answer for question:", question.id);
        return;
      }
      answersPayload.push({
        questionId: question.id,
        selectedIndex,
      });
    }

    const response = await submitQuiz({
      quizId: quizData.id,
      answers: answersPayload,
    });

    const payload = response.data;
    if (payload?.evaluation) {
      const nextSelections = payload.evaluation.answers.reduce<
        Record<string, number>
      >((accumulator, answer) => {
        accumulator[answer.id] = answer.selectedIndex;
        return accumulator;
      }, {});
      setSelectedAnswers(nextSelections);
    }
  }, [
    quizData,
    canSubmitQuiz,
    selectedAnswers,
    submitQuiz,
    setSelectedAnswers,
  ]);

  return {
    handleSubmitQuiz,
  };
}
