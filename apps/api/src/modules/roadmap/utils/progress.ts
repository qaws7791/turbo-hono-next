export const calculateCompletionPercent = (
  totalSubGoals: number,
  completedSubGoals: number,
): number => {
  if (totalSubGoals <= 0) {
    return 0;
  }

  const boundedTotal = Math.max(totalSubGoals, 0);
  const boundedCompleted = Math.min(
    Math.max(completedSubGoals, 0),
    boundedTotal,
  );

  return Math.round((boundedCompleted / boundedTotal) * 100);
};
