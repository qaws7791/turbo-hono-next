import { api } from "@/api/http-client";

export interface LearningPlanListParams {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: "active" | "archived";
  sort?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
}

export type LearningPlanDetailResponse = Awaited<
  ReturnType<typeof api.learningPlans.detail>
>;

export type LearningPlanListResponse = Awaited<
  ReturnType<typeof api.learningPlans.list>
>;

export type LearningTaskDetailResponse = Awaited<
  ReturnType<typeof api.learningTasks.detail>
>;

export type LearningModuleUpdateInput = Parameters<
  typeof api.learningModules.update
>[1];
export type LearningTaskUpdateInput = Parameters<
  typeof api.learningTasks.update
>[1];

export function listLearningPlans(params?: LearningPlanListParams) {
  return api.learningPlans.list(params);
}

export function getLearningPlanDetail(learningPlanId: string) {
  return api.learningPlans.detail(learningPlanId);
}

export function getLearningTaskDetail(learningTaskId: string) {
  return api.learningTasks.detail(learningTaskId);
}

export function getLearningTaskNote(learningTaskId: string) {
  return api.learningTasks.getNote(learningTaskId);
}

export function getLearningTaskQuiz(learningTaskId: string) {
  return api.learningTasks.getQuiz(learningTaskId);
}

export function updateLearningModule(
  learningModuleId: string,
  data: LearningModuleUpdateInput,
) {
  return api.learningModules.update(learningModuleId, data);
}

export function updateLearningTask(
  learningTaskId: string,
  data: LearningTaskUpdateInput,
) {
  return api.learningTasks.update(learningTaskId, data);
}

export function generateLearningTaskNote(
  learningTaskId: string,
  options?: { force?: boolean },
) {
  return api.ai.generateLearningTaskNote(learningTaskId, options);
}

export function generateLearningTaskQuiz(
  learningTaskId: string,
  options?: { force?: boolean },
) {
  return api.ai.generateLearningTaskQuiz(learningTaskId, options);
}

export function submitLearningTaskQuiz(
  quizId: string,
  answers: Array<{ questionId: string; selectedIndex: number }>,
) {
  return api.learningTasks.submitQuiz(quizId, answers);
}

export function uploadDocument(file: File) {
  return api.documents.upload(file);
}

export function getPlanRecommendations(
  data: Parameters<typeof api.ai.getPlanRecommendations>[0],
) {
  return api.ai.getPlanRecommendations(data);
}

export function generateLearningPlan(
  data: Parameters<typeof api.ai.generateLearningPlan>[0],
) {
  return api.ai.generateLearningPlan(data);
}
