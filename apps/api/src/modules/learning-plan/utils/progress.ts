export const calculateCompletionPercent = (
  totalLearningTasks: number,
  completedLearningTasks: number,
): number => {
  if (totalLearningTasks <= 0) {
    return 0;
  }

  const boundedTotal = Math.max(totalLearningTasks, 0);
  const boundedCompleted = Math.min(
    Math.max(completedLearningTasks, 0),
    boundedTotal,
  );

  return Math.round((boundedCompleted / boundedTotal) * 100);
};
