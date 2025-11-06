export const learningPlanKeys = {
  root: ["learningPlan"] as const,
  lists: () => [...learningPlanKeys.root, "list"] as const,
  list: (params?: unknown) =>
    params === undefined
      ? ([...learningPlanKeys.lists(), "all"] as const)
      : ([...learningPlanKeys.lists(), params] as const),
  detail: (learningPlanId: string) =>
    [...learningPlanKeys.root, "detail", learningPlanId] as const,
  learningTask: (learningTaskId: string) =>
    [...learningPlanKeys.root, "learning-task", learningTaskId] as const,
  learningTaskNote: (learningTaskId: string) =>
    [
      ...learningPlanKeys.root,
      "learning-task",
      learningTaskId,
      "note",
    ] as const,
  learningTaskQuiz: (learningTaskId: string) =>
    [
      ...learningPlanKeys.root,
      "learning-task",
      learningTaskId,
      "quiz",
    ] as const,
};
