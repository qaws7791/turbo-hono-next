import type { LearningTask } from "@/features/learning-plan/model/types";

import { LearningTaskItem } from "@/features/learning-plan/components/learning-task-item";

interface LearningTaskListProps {
  learningTasks: Array<LearningTask>;
  learningModuleId: string;
  learningPlanId: string;
  onToggleComplete?: (learningTaskId: string, isCompleted: boolean) => void;
  onUpdateDueDate?: (learningTaskId: string, dueDate: string | null) => void;
  updatingDueDateLearningTaskIds?: Set<string>;
}

function LearningTaskList({
  learningTasks,
  learningModuleId,
  learningPlanId,
  onToggleComplete,
  onUpdateDueDate,
  updatingDueDateLearningTaskIds,
}: LearningTaskListProps) {
  if (learningTasks.length === 0) {
    return (
      <div className={"text-sm text-muted-foreground"}>
        세부 목표가 없습니다.
      </div>
    );
  }

  const sortedLearningTasks = [...learningTasks].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className={"space-y-3"}>
      {sortedLearningTasks.map((learningTask, index) => (
        <LearningTaskItem
          key={learningTask.id}
          learningTask={learningTask}
          index={index + 1}
          learningModuleId={learningModuleId}
          learningPlanId={learningPlanId}
          onToggleComplete={onToggleComplete}
          onUpdateDueDate={onUpdateDueDate}
          isUpdatingDueDate={Boolean(
            updatingDueDateLearningTaskIds?.has(learningTask.id),
          )}
        />
      ))}
    </div>
  );
}

export { LearningTaskList };
