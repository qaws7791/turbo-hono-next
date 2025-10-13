import { SubGoalItem } from "@/domains/roadmap/components/sub-goal-item";
import type { SubGoal } from "@/domains/roadmap/types";

interface SubGoalListProps {
  subGoals: SubGoal[];
  goalId: string;
  roadmapId: string;
  onToggleComplete?: (subGoalId: string, isCompleted: boolean) => void;
  onUpdateDueDate?: (subGoalId: string, dueDate: string | null) => void;
  updatingDueDateSubGoalIds?: Set<string>;
}

function SubGoalList({
  subGoals,
  goalId,
  roadmapId,
  onToggleComplete,
  onUpdateDueDate,
  updatingDueDateSubGoalIds,
}: SubGoalListProps) {
  if (subGoals.length === 0) {
    return (
      <div className={"text-sm text-muted-foreground"}>
        세부 목표가 없습니다.
      </div>
    );
  }

  const sortedSubGoals = [...subGoals].sort((a, b) => a.order - b.order);

  return (
    <div className={"space-y-3"}>
      {sortedSubGoals.map((subGoal, index) => (
        <SubGoalItem
          key={subGoal.id}
          subGoal={subGoal}
          index={index + 1}
          goalId={goalId}
          roadmapId={roadmapId}
          onToggleComplete={onToggleComplete}
          onUpdateDueDate={onUpdateDueDate}
          isUpdatingDueDate={Boolean(updatingDueDateSubGoalIds?.has(subGoal.id))}
        />
      ))}
    </div>
  );
}

export { SubGoalList };
