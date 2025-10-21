export * from "./create";
export * from "./delete";
export * from "./detail";
export * from "./list";
export * from "./status";
export * from "./update";
export * from "./goals/create-goal";
export * from "./goals/delete-goal";
export * from "./goals/reorder-goal";
export * from "./goals/update-goal";
export * from "./sub-goals/create-sub-goal";
export * from "./sub-goals/delete-sub-goal";
export * from "./sub-goals/get-sub-goal";
export * from "./sub-goals/move-sub-goal";
export * from "./sub-goals/submit-sub-goal-quiz";
export * from "./sub-goals/update-sub-goal";

import { createRoadmapRoute } from "./create";
import { deleteRoadmapRoute } from "./delete";
import { roadmapDetailRoute } from "./detail";
import { roadmapListRoute } from "./list";
import { roadmapStatusRoute } from "./status";
import { updateRoadmapRoute } from "./update";
import { createGoalRoute } from "./goals/create-goal";
import { deleteGoalRoute } from "./goals/delete-goal";
import { reorderGoalRoute } from "./goals/reorder-goal";
import { updateGoalRoute } from "./goals/update-goal";
import { createSubGoalRoute } from "./sub-goals/create-sub-goal";
import { deleteSubGoalRoute } from "./sub-goals/delete-sub-goal";
import { getSubGoalRoute } from "./sub-goals/get-sub-goal";
import { moveSubGoalRoute } from "./sub-goals/move-sub-goal";
import { submitSubGoalQuizRoute } from "./sub-goals/submit-sub-goal-quiz";
import { updateSubGoalRoute } from "./sub-goals/update-sub-goal";

export const roadmapRoutes = [
  createRoadmapRoute,
  deleteRoadmapRoute,
  roadmapDetailRoute,
  roadmapListRoute,
  roadmapStatusRoute,
  updateRoadmapRoute,
  createGoalRoute,
  deleteGoalRoute,
  reorderGoalRoute,
  updateGoalRoute,
  createSubGoalRoute,
  deleteSubGoalRoute,
  getSubGoalRoute,
  moveSubGoalRoute,
  submitSubGoalQuizRoute,
  updateSubGoalRoute,
] as const;
