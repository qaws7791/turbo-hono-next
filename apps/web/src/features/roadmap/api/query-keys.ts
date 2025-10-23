export const roadmapKeys = {
  root: ["roadmap"] as const,
  lists: () => [...roadmapKeys.root, "list"] as const,
  list: (params?: unknown) =>
    params === undefined
      ? ([...roadmapKeys.lists(), "all"] as const)
      : ([...roadmapKeys.lists(), params] as const),
  detail: (roadmapId: string) =>
    [...roadmapKeys.root, "detail", roadmapId] as const,
  subGoal: (roadmapId: string, subGoalId: string) =>
    [...roadmapKeys.detail(roadmapId), "sub-goal", subGoalId] as const,
};
