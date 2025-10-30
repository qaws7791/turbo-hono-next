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
>[2];
export type LearningTaskUpdateInput = Parameters<
  typeof api.learningTasks.update
>[2];

export function listLearningPlans(params?: LearningPlanListParams) {
  return api.learningPlans.list(params);
}

export function getLearningPlanDetail(learningPlanId: string) {
  return api.learningPlans.detail(learningPlanId);
}

export function getLearningTaskDetail(
  learningPlanId: string,
  learningTaskId: string,
) {
  return api.learningTasks.detail(learningPlanId, learningTaskId);
}

export function updateLearningModule(
  learningPlanId: string,
  learningModuleId: string,
  data: LearningModuleUpdateInput,
) {
  return api.learningModules.update(learningPlanId, learningModuleId, data);
}

export function updateLearningTask(
  learningPlanId: string,
  learningTaskId: string,
  data: LearningTaskUpdateInput,
) {
  return api.learningTasks.update(learningPlanId, learningTaskId, data);
}

export function generateLearningTaskNote(
  learningPlanId: string,
  learningTaskId: string,
  options?: { force?: boolean },
) {
  return api.ai.generateLearningTaskNote(
    learningPlanId,
    learningTaskId,
    options,
  );
}

export function generateLearningTaskQuiz(
  learningPlanId: string,
  learningTaskId: string,
  options?: { force?: boolean },
) {
  return api.ai.generateLearningTaskQuiz(
    learningPlanId,
    learningTaskId,
    options,
  );
}

export function submitLearningTaskQuiz(
  learningPlanId: string,
  learningTaskId: string,
  quizId: string,
  answers: Array<{ questionId: string; selectedIndex: number }>,
) {
  return api.learningTasks.submitQuiz(
    learningPlanId,
    learningTaskId,
    quizId,
    answers,
  );
}

export function uploadDocument(file: File) {
  return api.documents.upload(file);
}

export function generateLearningPlan(
  data: Parameters<typeof api.ai.generateLearningPlan>[0],
) {
  return api.ai.generateLearningPlan(data);
}
