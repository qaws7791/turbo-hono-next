import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AI_QUIZ_STATUS_META } from "../status-meta";
import { formatDateTime, formatNullableDateTime } from "../utils";

import type {
  SubGoalDetail,
  SubGoalQuizAnswerReview,
  SubGoalQuizStatus,
} from "@/domains/roadmap/types";

import { api } from "@/api/http-client";

type AiQuizTabProps = {
  detail: SubGoalDetail;
  roadmapId: string;
  subGoalId: string;
};

export function AiQuizTab({ detail, roadmapId, subGoalId }: AiQuizTabProps) {
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});

  const generateQuizMutation = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      api.ai.generateSubGoalQuiz(
        roadmapId,
        subGoalId,
        options?.force ? { force: options.force } : undefined,
      ),
    onSuccess: async () => {
      setSelectedAnswers({});
      await queryClient.invalidateQueries({
        queryKey: ["subgoal", roadmapId, subGoalId],
      });
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (variables: {
      quizId: string;
      answers: Array<{ questionId: string; selectedIndex: number }>;
    }) => {
      return api.subGoals.submitQuiz(
        roadmapId,
        subGoalId,
        variables.quizId,
        variables.answers,
      );
    },
    onSuccess: async (response) => {
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
      await queryClient.invalidateQueries({
        queryKey: ["subgoal", roadmapId, subGoalId],
      });
    },
  });

  const quizData = detail.aiQuiz;
  const quizStatus: SubGoalQuizStatus = quizData?.status ?? "idle";
  const quizStatusMeta = AI_QUIZ_STATUS_META[quizStatus];
  const isQuizProcessing =
    quizStatus === "processing" || generateQuizMutation.isPending;
  const generateQuizErrorMessage =
    generateQuizMutation.error instanceof Error
      ? generateQuizMutation.error.message
      : null;
  const submitQuizErrorMessage =
    submitQuizMutation.error instanceof Error
      ? submitQuizMutation.error.message
      : null;
  const quizQuestions = quizData?.questions ?? [];
  const latestQuizResult = quizData?.latestResult ?? null;
  const quizRequestedAtLabel = formatNullableDateTime(quizData?.requestedAt);
  const quizCompletedAtLabel = formatNullableDateTime(quizData?.completedAt);

  const quizResultMap: Map<string, SubGoalQuizAnswerReview> | null =
    latestQuizResult
      ? new Map(latestQuizResult.answers.map((answer) => [answer.id, answer]))
      : null;
  const latestQuizSubmittedLabel = latestQuizResult
    ? formatDateTime(latestQuizResult.submittedAt)
    : null;
  const answeredCount = quizQuestions.reduce((count, question) => {
    return selectedAnswers[question.id] !== undefined ? count + 1 : count;
  }, 0);

  const allQuestionsAnswered =
    quizQuestions.length > 0 &&
    quizQuestions.every(
      (question) => selectedAnswers[question.id] !== undefined,
    );
  const canSubmitQuiz =
    Boolean(
      quizData &&
        quizStatus === "ready" &&
        quizQuestions.length > 0 &&
        !latestQuizResult &&
        allQuestionsAnswered,
    ) && !submitQuizMutation.isPending;
  const isQuizOptionDisabled =
    quizStatus !== "ready" ||
    Boolean(latestQuizResult) ||
    isQuizProcessing ||
    submitQuizMutation.isPending;

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
  }, [quizData?.id, quizData?.latestResult?.submittedAt]);

  const handleGenerateQuiz = (force?: boolean) => {
    if (isQuizProcessing) {
      return;
    }

    void generateQuizMutation.mutateAsync(force ? { force: true } : undefined);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (isQuizOptionDisabled) {
      return;
    }

    setSelectedAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!quizData || !canSubmitQuiz) {
      return;
    }

    const answersPayload = quizQuestions.map((question) => {
      const selectedIndex = selectedAnswers[question.id];
      if (selectedIndex === undefined) {
        throw new Error("모든 문항에 답변한 후에만 제출할 수 있습니다.");
      }
      return {
        questionId: question.id,
        selectedIndex,
      };
    });

    submitQuizMutation.mutate({
      quizId: quizData.id,
      answers: answersPayload,
    });
  };

  console.log(latestQuizResult);
  console.log(quizResultMap);

  return (
    <>
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon
              name="solar--question-circle-outline"
              type="iconify"
              className="size-4 text-primary"
            />
            <h2 className="text-sm font-semibold text-foreground">
              AI 학습 퀴즈
            </h2>
          </div>
          <Badge variant={quizStatusMeta.badgeVariant}>
            {quizStatusMeta.label}
          </Badge>
        </div>

        {isQuizProcessing && (
          <div className="flex items-center gap-3 rounded-md border border-muted bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>AI가 퀴즈를 생성하는 중입니다. 잠시만 기다려주세요.</span>
          </div>
        )}

        {quizStatus === "failed" && quizData?.errorMessage && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {quizData.errorMessage}
          </div>
        )}

        {generateQuizErrorMessage && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {generateQuizErrorMessage}
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            세부 목표 설명과 학습 노트를 분석해 최소 4문항, 최대 20문항의
            4지선다형 퀴즈를 제공합니다.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>모든 문항을 풀고 제출하면 정답과 해설이 공개됩니다.</li>
            <li>필요할 때마다 새로운 버전의 퀴즈를 다시 생성할 수 있어요.</li>
            <li>정답은 서버에서 채점되며 제출 전에는 저장되지 않습니다.</li>
          </ul>
        </div>

        {quizData && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span>
              최근 요청:{" "}
              <span className="font-medium text-foreground">
                {quizRequestedAtLabel}
              </span>
            </span>
            <span>
              최근 완료:{" "}
              <span className="font-medium text-foreground">
                {quizCompletedAtLabel}
              </span>
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              handleGenerateQuiz(
                quizStatus === "ready" || quizStatus === "failed"
                  ? true
                  : undefined,
              )
            }
            size="sm"
            variant={quizStatus === "ready" ? "outline" : "primary"}
            isDisabled={isQuizProcessing}
          >
            {isQuizProcessing && (
              <span className="mr-2 inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {quizStatus === "ready"
              ? "퀴즈 다시 생성"
              : quizStatus === "failed"
                ? "다시 시도"
                : "AI 퀴즈 생성"}
          </Button>
          {quizStatus === "ready" && (
            <Button
              onClick={() => handleGenerateQuiz(true)}
              isDisabled={isQuizProcessing}
              size="sm"
              variant="ghost"
            >
              다른 버전 생성
            </Button>
          )}
        </div>
      </Card>

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
                <div
                  key={question.id}
                  className="space-y-3 rounded-md border border-muted bg-background p-4"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-sm font-semibold text-primary">
                      Q{questionIndex + 1}
                    </span>
                    <p className="text-sm text-foreground">{question.prompt}</p>
                  </div>
                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected =
                        selectedAnswers[question.id] === optionIndex;
                      const isCorrect =
                        evaluation?.correctIndex === optionIndex;
                      const isUserChoice =
                        evaluation?.selectedIndex === optionIndex;
                      const baseClasses =
                        "w-full rounded-md border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40";
                      const interactiveClasses =
                        " border-muted bg-background text-foreground hover:border-primary/40 hover:bg-primary/5";
                      const selectedClasses =
                        " border-primary bg-primary/10 text-primary";
                      const correctClasses =
                        " border-green-500 bg-green-50 text-green-900";
                      const incorrectClasses =
                        " border-destructive bg-destructive/10 text-destructive";

                      const optionClasses =
                        baseClasses +
                        (evaluation
                          ? isCorrect
                            ? correctClasses
                            : isUserChoice
                              ? incorrectClasses
                              : " border-muted bg-background text-foreground"
                          : isSelected
                            ? selectedClasses
                            : interactiveClasses) +
                        (isQuizOptionDisabled && !evaluation
                          ? " opacity-60"
                          : "");

                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          onClick={() =>
                            handleSelectAnswer(question.id, optionIndex)
                          }
                          className={optionClasses}
                          disabled={isQuizOptionDisabled}
                        >
                          <span className="mr-2 font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                  {evaluation && (
                    <div className="rounded-md border border-primary/40 px-4 py-3 text-sm ">
                      <div className="font-semibold text-primary">
                        정답은{" "}
                        {String.fromCharCode(65 + evaluation.correctIndex)}
                      </div>
                      <p className="mt-1">{evaluation.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!latestQuizResult && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {answeredCount}/{quizQuestions.length} 문항 선택됨
              </div>
              <div className="flex flex-col items-end gap-2">
                {submitQuizErrorMessage && (
                  <div className="text-sm text-destructive">
                    {submitQuizErrorMessage}
                  </div>
                )}
                <Button
                  onClick={handleSubmitQuiz}
                  isDisabled={!canSubmitQuiz}
                >
                  {submitQuizMutation.isPending && (
                    <span className="mr-2 inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  결과 제출
                </Button>
              </div>
            </div>
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
