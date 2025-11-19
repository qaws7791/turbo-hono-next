import { Button } from "@repo/ui/button";

type QuizSubmitSectionProps = {
  answeredCount: number;
  totalQuestions: number;
  canSubmitQuiz: boolean;
  isSubmitPending: boolean;
  submitErrorMessage: string | null;
  onSubmit: () => void;
};

export function QuizSubmitSection({
  answeredCount,
  totalQuestions,
  canSubmitQuiz,
  isSubmitPending,
  submitErrorMessage,
  onSubmit,
}: QuizSubmitSectionProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        {answeredCount}/{totalQuestions} 문항 선택됨
      </div>
      <div className="flex flex-col items-end gap-2">
        {submitErrorMessage && (
          <div className="text-sm text-destructive">{submitErrorMessage}</div>
        )}
        <Button
          onClick={onSubmit}
          isDisabled={!canSubmitQuiz}
        >
          {isSubmitPending && (
            <span className="mr-2 inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          결과 제출
        </Button>
      </div>
    </div>
  );
}
