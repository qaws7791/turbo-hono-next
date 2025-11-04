import { createLearningPlanRoute } from "./create";
import { deleteLearningPlanRoute } from "./delete";
import { learningPlanDetailRoute } from "./detail";
import { createLearningModuleRoute } from "./learning-modules/create-learning-module";
import { deleteLearningModuleRoute } from "./learning-modules/delete-learning-module";
import { reorderLearningModuleRoute } from "./learning-modules/reorder-learning-module";
import { updateLearningModuleRoute } from "./learning-modules/update-learning-module";
import { createLearningTaskRoute } from "./learning-tasks/create-learning-task";
import { deleteLearningTaskRoute } from "./learning-tasks/delete-learning-task";
import { getLearningTaskRoute } from "./learning-tasks/get-learning-task";
import { getLearningTaskNoteRoute } from "./learning-tasks/get-learning-task-note";
import { getLearningTaskQuizRoute } from "./learning-tasks/get-learning-task-quiz";
import { moveLearningTaskRoute } from "./learning-tasks/move-learning-task";
import { submitLearningTaskQuizRoute } from "./learning-tasks/submit-learning-task-quiz";
import { updateLearningTaskRoute } from "./learning-tasks/update-learning-task";
import { learningPlanListRoute } from "./list";
import { learningPlanStatusRoute } from "./status";
import { updateLearningPlanRoute } from "./update";

export * from "./create";
export * from "./delete";
export * from "./detail";
export * from "./learning-modules/create-learning-module";
export * from "./learning-modules/delete-learning-module";
export * from "./learning-modules/reorder-learning-module";
export * from "./learning-modules/update-learning-module";
export * from "./learning-tasks/create-learning-task";
export * from "./learning-tasks/delete-learning-task";
export * from "./learning-tasks/get-learning-task";
export * from "./learning-tasks/get-learning-task-note";
export * from "./learning-tasks/get-learning-task-quiz";
export * from "./learning-tasks/move-learning-task";
export * from "./learning-tasks/submit-learning-task-quiz";
export * from "./learning-tasks/update-learning-task";
export * from "./list";
export * from "./status";
export * from "./update";

export const learningPlanRoutes = [
  createLearningPlanRoute,
  deleteLearningPlanRoute,
  learningPlanDetailRoute,
  learningPlanListRoute,
  learningPlanStatusRoute,
  updateLearningPlanRoute,
  createLearningModuleRoute,
  deleteLearningModuleRoute,
  reorderLearningModuleRoute,
  updateLearningModuleRoute,
  createLearningTaskRoute,
  deleteLearningTaskRoute,
  getLearningTaskRoute,
  getLearningTaskNoteRoute,
  getLearningTaskQuizRoute,
  moveLearningTaskRoute,
  submitLearningTaskQuizRoute,
  updateLearningTaskRoute,
] as const;
