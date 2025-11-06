import type { paths } from "@/api/schema";
import type { LearningModule } from "@/features/learning-plan/model/types";

type ApiLearningModule =
  paths["/plans/{id}"]["get"]["responses"][200]["content"]["application/json"]["learningModules"][number];
type ApiLearningTask =
  ApiLearningModule["learningTasks"] extends Array<infer T> ? T : never;

export function transformLearningModules(
  apiLearningModules: Array<ApiLearningModule>,
): Array<LearningModule> {
  return apiLearningModules.map((learningModule) => {
    const learningTasks: Array<ApiLearningTask> =
      learningModule.learningTasks ?? [];
    const completedLearningTasks =
      learningTasks.filter(
        (learningTask: ApiLearningTask) => learningTask.isCompleted,
      ).length || 0;
    const hasLearningTasks = learningTasks.length > 0;
    const isCompleted = hasLearningTasks
      ? completedLearningTasks === learningTasks.length
      : false;

    return {
      id: learningModule.id,
      title: learningModule.title,
      description: learningModule.description,
      order: learningModule.order,
      isExpanded: learningModule.isExpanded,
      learningTasks,
      hasLearningTasks,
      completedLearningTasks,
      isCompleted,
    };
  });
}
