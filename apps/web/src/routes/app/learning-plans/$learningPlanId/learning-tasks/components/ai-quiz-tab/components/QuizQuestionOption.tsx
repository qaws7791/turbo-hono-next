import { getQuizOptionClasses } from "../utils/quiz-option-styles";

type QuizQuestionOptionProps = {
  option: string;
  optionIndex: number;
  questionId: string;
  isSelected: boolean;
  isCorrect: boolean;
  isUserChoice: boolean;
  hasEvaluation: boolean;
  isDisabled: boolean;
  onSelect: (questionId: string, optionIndex: number) => void;
};

export function QuizQuestionOption({
  option,
  optionIndex,
  questionId,
  isSelected,
  isCorrect,
  isUserChoice,
  hasEvaluation,
  isDisabled,
  onSelect,
}: QuizQuestionOptionProps) {
  const optionClasses = getQuizOptionClasses({
    isSelected,
    isCorrect,
    isUserChoice,
    hasEvaluation,
    isDisabled,
  });

  return (
    <button
      type="button"
      onClick={() => onSelect(questionId, optionIndex)}
      className={optionClasses}
      disabled={isDisabled}
    >
      <span className="mr-2 font-medium">
        {String.fromCharCode(65 + optionIndex)}.
      </span>
      <span>{option}</span>
    </button>
  );
}
