import { useCallback, useMemo } from "react";
import { Card } from "@repo/ui/card";

import { QuizQuestionCard } from "./ai-quiz-tab/components/QuizQuestionCard";
import { QuizStatusCard } from "./ai-quiz-tab/components/QuizStatusCard";
import { QuizSubmitSection } from "./ai-quiz-tab/components/QuizSubmitSection";
import { useQuizAnswerSelection } from "./ai-quiz-tab/hooks/useQuizAnswerSelection";
import { useQuizMetadata } from "./ai-quiz-tab/hooks/useQuizMetadata";
import { useQuizSubmission } from "./ai-quiz-tab/hooks/useQuizSubmission";

import type { LearningTaskQuizAnswerReview } from "@/features/learning-plan/model/types";

import { useLearningTaskQuiz } from "@/features/learning-plan/hooks/use-learning-task-quiz";
import {
  formatDateTime,
  formatNullableDateTime,
} from "@/features/learning-plan/model/date";
import { AI_QUIZ_STATUS_META } from "@/features/learning-plan/model/status-meta";

type AiQuizTabProps = {
  learningTaskId: string;
};

export function AiQuizTab({ learningTaskId }: AiQuizTabProps) {
  const {
    quizData,
    generateQuiz,
    isGeneratePending,
    generateErrorMessage,
    submitQuiz,
    isSubmitPending,
    submitErrorMessage,
  } = useLearningTaskQuiz({ learningTaskId });

  const {
    selectedAnswers,
    setSelectedAnswers,
    handleSelectAnswer,
    resetAnswers,
  } = useQuizAnswerSelection({
    quizData,
  });

  const {
    quizStatus,
    quizQuestions,
    latestQuizResult,
    isQuizProcessing,
    answeredCount,
    canSubmitQuiz,
    isQuizOptionDisabled,
  } = useQuizMetadata({
    quizData,
    selectedAnswers,
    isGeneratePending,
    isSubmitPending,
  });

  const { handleSubmitQuiz } = useQuizSubmission({
    quizData,
    selectedAnswers,
    canSubmitQuiz,
    submitQuiz,
    setSelectedAnswers,
  });

  const quizStatusMeta = AI_QUIZ_STATUS_META[quizStatus];
  const quizRequestedAtLabel = formatNullableDateTime(
    quizData?.requestedAt ?? null,
  );
  const quizCompletedAtLabel = formatNullableDateTime(
    quizData?.completedAt ?? null,
  );

  const quizResultMap = useMemo<Map<
    string,
    LearningTaskQuizAnswerReview
  > | null>(
    () =>
      latestQuizResult
        ? new Map(latestQuizResult.answers.map((answer) => [answer.id, answer]))
        : null,
    [latestQuizResult],
  );

  const latestQuizSubmittedLabel = latestQuizResult
    ? formatDateTime(latestQuizResult.submittedAt)
    : null;

  const handleGenerateQuiz = useCallback(
    async (force?: boolean) => {
      if (isQuizProcessing) {
        return;
      }

      await generateQuiz(force);
      resetAnswers();
    },
    [isQuizProcessing, generateQuiz, resetAnswers],
  );

  return (
    <>
      <QuizStatusCard
        quizStatus={quizStatus}
        quizStatusMeta={quizStatusMeta}
        isQuizProcessing={isQuizProcessing}
        generateErrorMessage={generateErrorMessage}
        quizData={quizData}
        quizRequestedAtLabel={quizRequestedAtLabel}
        quizCompletedAtLabel={quizCompletedAtLabel}
        onGenerateQuiz={handleGenerateQuiz}
      />

      {quizStatus === "ready" && quizQuestions.length > 0 ? (
        <Card className="space-y-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                문제 풀기
              </h3>
              {latestQuizResult ? (
                <p className="text-xs text-muted-foreground">
                  최근 제출: {latestQuizSubmittedLabel}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  보기 하나를 선택하면 잠시 표시되며, 제출해야 저장됩니다.
                </p>
              )}
            </div>
            {latestQuizResult && (
              <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                {latestQuizResult.correctCount}/
                {latestQuizResult.totalQuestions} 정답 ·{" "}
                {latestQuizResult.scorePercent}%
              </div>
            )}
          </div>

          {!latestQuizResult && quizQuestions.length > 0 && (
            <div className="flex items-center justify-between rounded-md border border-muted/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <span>
                선택 완료: {answeredCount}/{quizQuestions.length}
              </span>
              <span>모든 문항을 선택하면 제출 버튼이 활성화됩니다.</span>
            </div>
          )}

          <div className="space-y-4">
            {quizQuestions.map((question, questionIndex) => {
              const evaluation = quizResultMap?.get(question.id);
              return (
                <QuizQuestionCard
                  key={question.id}
                  question={question}
                  questionIndex={questionIndex}
                  selectedAnswers={selectedAnswers}
                  evaluation={evaluation}
                  isQuizOptionDisabled={isQuizOptionDisabled}
                  onSelectAnswer={handleSelectAnswer}
                />
              );
            })}
          </div>

          {!latestQuizResult && (
            <QuizSubmitSection
              answeredCount={answeredCount}
              totalQuestions={quizQuestions.length}
              canSubmitQuiz={canSubmitQuiz}
              isSubmitPending={isSubmitPending}
              submitErrorMessage={submitErrorMessage}
              onSubmit={handleSubmitQuiz}
            />
          )}
        </Card>
      ) : quizStatus === "processing" ? null : (
        <Card className="space-y-2 p-4 text-sm text-muted-foreground">
          <p>
            아직 생성된 퀴즈가 없습니다. 위의 버튼을 눌러 AI에게 학습 퀴즈를
            요청해보세요.
          </p>
        </Card>
      )}
    </>
  );
}
