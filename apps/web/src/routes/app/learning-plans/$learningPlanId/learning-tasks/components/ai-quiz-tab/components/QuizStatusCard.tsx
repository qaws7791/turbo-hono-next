import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";

import type {
  LearningTaskQuiz,
  LearningTaskQuizStatus,
} from "@/features/learning-plan/model/types";

type QuizStatusMeta = {
  label: string;
  badgeVariant: "outline" | "primary" | "secondary" | "destructive";
};

type QuizStatusCardProps = {
  quizStatus: LearningTaskQuizStatus;
  quizStatusMeta: QuizStatusMeta;
  isQuizProcessing: boolean;
  generateErrorMessage: string | null;
  quizData: LearningTaskQuiz | undefined;
  quizRequestedAtLabel: string;
  quizCompletedAtLabel: string;
  onGenerateQuiz: (force?: boolean) => void;
};

export function QuizStatusCard({
  quizStatus,
  quizStatusMeta,
  isQuizProcessing,
  generateErrorMessage,
  quizData,
  quizRequestedAtLabel,
  quizCompletedAtLabel,
  onGenerateQuiz,
}: QuizStatusCardProps) {
  return (
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

      {generateErrorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {generateErrorMessage}
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
            onGenerateQuiz(
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
            onClick={() => onGenerateQuiz(true)}
            isDisabled={isQuizProcessing}
            size="sm"
            variant="ghost"
          >
            다른 버전 생성
          </Button>
        )}
      </div>
    </Card>
  );
}
