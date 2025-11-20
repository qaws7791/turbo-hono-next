/**
 * Learning Plan Mappers
 *
 * API 응답 타입을 도메인 모델로 변환하는 함수들
 */

import type {
  ApiLearningModule,
  ApiLearningTask,
} from "@/features/learning-plan/api/types";
import type { LearningModule } from "@/features/learning-plan/model/types";

/**
 * API LearningModule 배열을 도메인 LearningModule 배열로 변환
 *
 * @param apiLearningModules - API 응답 learningModules 배열
 * @returns 도메인 LearningModule 배열 (computed properties 포함)
 */
export function transformLearningModules(
  apiLearningModules: ReadonlyArray<ApiLearningModule>,
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
