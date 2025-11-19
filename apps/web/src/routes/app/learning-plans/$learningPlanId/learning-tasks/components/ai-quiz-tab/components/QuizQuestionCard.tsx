import { QuizQuestionOption } from "./QuizQuestionOption";

import type {
  LearningTaskQuizAnswerReview,
  LearningTaskQuizQuestion,
} from "@/features/learning-plan/model/types";

type QuizQuestionCardProps = {
  question: LearningTaskQuizQuestion;
  questionIndex: number;
  selectedAnswers: Record<string, number>;
  evaluation?: LearningTaskQuizAnswerReview;
  isQuizOptionDisabled: boolean;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
};

export function QuizQuestionCard({
  question,
  questionIndex,
  selectedAnswers,
  evaluation,
  isQuizOptionDisabled,
  onSelectAnswer,
}: QuizQuestionCardProps) {
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
        {question.options.map((option: string, optionIndex: number) => {
          const isSelected = selectedAnswers[question.id] === optionIndex;
          const isCorrect = evaluation?.correctIndex === optionIndex;
          const isUserChoice = evaluation?.selectedIndex === optionIndex;

          return (
            <QuizQuestionOption
              key={optionIndex}
              option={option}
              optionIndex={optionIndex}
              questionId={question.id}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isUserChoice={isUserChoice}
              hasEvaluation={Boolean(evaluation)}
              isDisabled={isQuizOptionDisabled}
              onSelect={onSelectAnswer}
            />
          );
        })}
      </div>
      {evaluation && (
        <div className="rounded-md border border-primary/40 px-4 py-3 text-sm ">
          <div className="font-semibold text-primary">
            정답은 {String.fromCharCode(65 + evaluation.correctIndex)}
          </div>
          <p className="mt-1">{evaluation.explanation}</p>
        </div>
      )}
    </div>
  );
}
