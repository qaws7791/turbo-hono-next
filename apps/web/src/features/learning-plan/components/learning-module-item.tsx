import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";

import type { LearningModule } from "@/features/learning-plan/model/types";

import { LearningTaskList } from "@/features/learning-plan/components/learning-task-list";
import { useLearningModuleItem } from "@/features/learning-plan/hooks/use-learning-module-item";

interface LearningModuleItemProps {
  learningModule: LearningModule;
  learningPlanId: string;
}

interface LearningModuleInfoProps {
  learningModule: LearningModule;
  onToggleExpansion: () => void;
  isToggling?: boolean;
}

function LearningModuleInfo({
  learningModule,
  onToggleExpansion,
  isToggling = false,
}: LearningModuleInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {learningModule.isCompleted ? (
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
            className={`font-medium text-foreground ${learningModule.isCompleted ? "line-through opacity-75" : ""}`}
          >
            {learningModule.title}
          </h3>
          {learningModule.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {learningModule.description}
            </p>
          )}
        </div>
      </div>

      {learningModule.hasLearningTasks && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon
                name="solar--list-outline"
                type="iconify"
                className="h-4 w-4"
              />
              <span>
                {learningModule.completedLearningTasks}/
                {learningModule.learningTasks.length} 완료
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.round((learningModule.completedLearningTasks / learningModule.learningTasks.length) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {Math.round(
                  (learningModule.completedLearningTasks /
                    learningModule.learningTasks.length) *
                    100,
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
            {learningModule.isExpanded ? (
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
                세부 목표 {learningModule.learningTasks.length}개 보기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function LearningModuleItem({
  learningModule,
  learningPlanId,
}: LearningModuleItemProps) {
  const {
    isTogglingLearningModule,
    updatingDueDateLearningTaskIds,
    toggleExpansion,
    toggleLearningTaskCompletion,
    updateLearningTaskDueDate,
  } = useLearningModuleItem({ learningModule, learningPlanId });

  return (
    <Card className="py-2 px-2">
      <div className="p-4 space-y-4">
        <LearningModuleInfo
          learningModule={learningModule}
          onToggleExpansion={toggleExpansion}
          isToggling={isTogglingLearningModule}
        />

        {learningModule.isExpanded && learningModule.hasLearningTasks && (
          <div className="border-t pt-4">
            <LearningTaskList
              learningTasks={learningModule.learningTasks}
              learningModuleId={learningModule.id}
              learningPlanId={learningPlanId}
              onToggleComplete={toggleLearningTaskCompletion}
              onUpdateDueDate={updateLearningTaskDueDate}
              updatingDueDateLearningTaskIds={updatingDueDateLearningTaskIds}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export { LearningModuleItem };
