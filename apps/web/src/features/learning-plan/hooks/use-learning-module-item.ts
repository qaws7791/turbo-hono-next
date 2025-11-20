import { useLearningModuleExpansion } from "./use-learning-module-expansion";
import { useLearningTaskCompletion } from "./use-learning-task-completion";
import { useLearningTaskDueDate } from "./use-learning-task-due-date";

import type { LearningModule } from "@/features/learning-plan/model/types";

interface UseLearningModuleItemParams {
  learningPlanId: string;
  learningModule: LearningModule;
}

/**
 * 학습 모듈 아이템의 모든 인터랙션을 관리하는 Composition Hook
 *
 * 이 hook은 다음 기능들을 조합합니다:
 * - 모듈 확장/축소 (useLearningModuleExpansion)
 * - 태스크 완료/미완료 (useLearningTaskCompletion)
 * - 태스크 마감일 변경 (useLearningTaskDueDate)
 *
 * React의 Composition 패턴을 따라 각 기능을 독립적인 hook으로 분리하여
 * 테스트와 재사용이 용이하도록 구성되었습니다.
 */
export function useLearningModuleItem({
  learningPlanId,
  learningModule,
}: UseLearningModuleItemParams) {
  const { toggleExpansion, isPending: isTogglingLearningModule } =
    useLearningModuleExpansion({
      learningPlanId,
      learningModule,
    });

  const { toggleLearningTaskCompletion } = useLearningTaskCompletion({
    learningPlanId,
    learningModule,
  });

  const { updateLearningTaskDueDate, updatingDueDateLearningTaskIds } =
    useLearningTaskDueDate({
      learningPlanId,
      learningModule,
    });

  return {
    isTogglingLearningModule,
    updatingDueDateLearningTaskIds,
    toggleExpansion,
    toggleLearningTaskCompletion,
    updateLearningTaskDueDate,
  };
}
