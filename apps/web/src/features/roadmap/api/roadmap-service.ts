import { api } from "@/api/http-client";

export interface RoadmapListParams {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: "active" | "archived";
  sort?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
}

export type RoadmapDetailResponse = Awaited<
  ReturnType<typeof api.roadmaps.detail>
>;

export type RoadmapListResponse = Awaited<ReturnType<typeof api.roadmaps.list>>;

export type SubGoalDetailResponse = Awaited<
  ReturnType<typeof api.subGoals.detail>
>;

export type GoalUpdateInput = Parameters<typeof api.goals.update>[2];
export type SubGoalUpdateInput = Parameters<typeof api.subGoals.update>[2];

export function listRoadmaps(params?: RoadmapListParams) {
  return api.roadmaps.list(params);
}

export function getRoadmapDetail(roadmapId: string) {
  return api.roadmaps.detail(roadmapId);
}

export function getSubGoalDetail(roadmapId: string, subGoalId: string) {
  return api.subGoals.detail(roadmapId, subGoalId);
}

export function updateGoal(
  roadmapId: string,
  goalId: string,
  data: GoalUpdateInput,
) {
  return api.goals.update(roadmapId, goalId, data);
}

export function updateSubGoal(
  roadmapId: string,
  subGoalId: string,
  data: SubGoalUpdateInput,
) {
  return api.subGoals.update(roadmapId, subGoalId, data);
}

export function generateSubGoalNote(
  roadmapId: string,
  subGoalId: string,
  options?: { force?: boolean },
) {
  return api.ai.generateSubGoalNote(roadmapId, subGoalId, options);
}

export function generateSubGoalQuiz(
  roadmapId: string,
  subGoalId: string,
  options?: { force?: boolean },
) {
  return api.ai.generateSubGoalQuiz(roadmapId, subGoalId, options);
}

export function submitSubGoalQuiz(
  roadmapId: string,
  subGoalId: string,
  quizId: string,
  answers: Array<{ questionId: string; selectedIndex: number }>,
) {
  return api.subGoals.submitQuiz(roadmapId, subGoalId, quizId, answers);
}

export function uploadDocument(file: File) {
  return api.documents.upload(file);
}

export function generateRoadmap(
  data: Parameters<typeof api.ai.generateRoadmap>[0],
) {
  return api.ai.generateRoadmap(data);
}
