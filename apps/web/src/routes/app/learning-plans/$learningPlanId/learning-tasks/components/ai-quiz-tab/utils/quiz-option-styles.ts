type QuizOptionStyleParams = {
  isSelected: boolean;
  isCorrect: boolean;
  isUserChoice: boolean;
  hasEvaluation: boolean;
  isDisabled: boolean;
};

export function getQuizOptionClasses({
  isSelected,
  isCorrect,
  isUserChoice,
  hasEvaluation,
  isDisabled,
}: QuizOptionStyleParams): string {
  const baseClasses =
    "w-full rounded-md border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40";
  const interactiveClasses =
    " border-muted bg-background text-foreground hover:border-primary/40 hover:bg-primary/5";
  const selectedClasses = " border-primary bg-primary/10 text-primary";
  const correctClasses = " border-green-500 bg-green-50 text-green-900";
  const incorrectClasses =
    " border-destructive bg-destructive/10 text-destructive";
  const neutralClasses = " border-muted bg-background text-foreground";

  let stateClasses = "";
  if (hasEvaluation) {
    if (isCorrect) {
      stateClasses = correctClasses;
    } else if (isUserChoice) {
      stateClasses = incorrectClasses;
    } else {
      stateClasses = neutralClasses;
    }
  } else {
    stateClasses = isSelected ? selectedClasses : interactiveClasses;
  }

  const disabledClasses = isDisabled && !hasEvaluation ? " opacity-60" : "";

  return baseClasses + stateClasses + disabledClasses;
}
