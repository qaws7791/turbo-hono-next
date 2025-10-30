export const learningPlanKeys = {
  root: ["learningPlan"] as const,
  lists: () => [...learningPlanKeys.root, "list"] as const,
  list: (params?: unknown) =>
    params === undefined
      ? ([...learningPlanKeys.lists(), "all"] as const)
      : ([...learningPlanKeys.lists(), params] as const),
  detail: (learningPlanId: string) =>
    [...learningPlanKeys.root, "detail", learningPlanId] as const,
  learningTask: (learningPlanId: string, learningTaskId: string) =>
    [
      ...learningPlanKeys.detail(learningPlanId),
      "learning-task",
      learningTaskId,
    ] as const,
};
