import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";

import type { Goal } from "@/domains/roadmap/model/types";

import { SubGoalList } from "@/domains/roadmap/components/sub-goal-list";
import { useGoalItem } from "@/domains/roadmap/hooks/use-goal-item";

interface GoalItemProps {
  goal: Goal;
  roadmapId: string;
}

interface GoalInfoProps {
  goal: Goal;
  onToggleExpansion: () => void;
  isToggling?: boolean;
}

function GoalInfo({
  goal,
  onToggleExpansion,
  isToggling = false,
}: GoalInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {goal.isCompleted ? (
            <Icon
              name="solar--check-square-outline"
              type="iconify"
              className="h-5 w-5 text-green-600"
            />
          ) : (
            <Icon
              name="solar--stop-outline"
              type="iconify"
              className="h-5 w-5 text-muted-foreground"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`font-medium text-foreground ${goal.isCompleted ? "line-through opacity-75" : ""}`}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {goal.hasSubGoals && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon
                name="solar--list-outline"
                type="iconify"
                className="h-4 w-4"
              />
              <span>
                {goal.completedSubGoals}/{goal.subGoals.length} 완료
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.round((goal.completedSubGoals / goal.subGoals.length) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {Math.round(
                  (goal.completedSubGoals / goal.subGoals.length) * 100,
                )}
                %
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 ml-auto"
            onPress={onToggleExpansion}
            isDisabled={isToggling}
          >
            {goal.isExpanded ? (
              <>
                <Icon
                  name="solar--alt-arrow-up-outline"
                  type="iconify"
                  className="h-4 w-4 mr-1"
                />
                접기
              </>
            ) : (
              <>
                <Icon
                  name="solar--alt-arrow-down-outline"
                  type="iconify"
                  className="h-4 w-4 mr-1"
                />
                세부 목표 {goal.subGoals.length}개 보기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function GoalItem({ goal, roadmapId }: GoalItemProps) {
  const {
    isTogglingGoal,
    updatingDueDateSubGoalIds,
    toggleExpansion,
    toggleSubGoalCompletion,
    updateSubGoalDueDate,
  } = useGoalItem({ goal, roadmapId });

  return (
    <Card className="py-2 px-2">
      <div className="p-4 space-y-4">
        <GoalInfo
          goal={goal}
          onToggleExpansion={toggleExpansion}
          isToggling={isTogglingGoal}
        />

        {goal.isExpanded && goal.hasSubGoals && (
          <div className="border-t pt-4">
            <SubGoalList
              subGoals={goal.subGoals}
              goalId={goal.id}
              roadmapId={roadmapId}
              onToggleComplete={toggleSubGoalCompletion}
              onUpdateDueDate={updateSubGoalDueDate}
              updatingDueDateSubGoalIds={updatingDueDateSubGoalIds}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export { GoalItem };
