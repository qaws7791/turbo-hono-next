import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";

import type { LearningModule } from "@/features/learning-plan/model/types";

import { LearningModuleItem } from "@/features/learning-plan/components/learning-module-item";

interface LearningModuleListProps {
  learningModules: Array<LearningModule>;
  learningPlanId: string;
}

function EmptyLearningModuleList() {
  return (
    <Card className="p-8 text-center space-y-4">
      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
        <Icon
          name="solar--target-outline"
          type="iconify"
          className="size-6 text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">목표가 없습니다</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          이 학습 계획에는 아직 목표가 설정되지 않았습니다.
        </p>
      </div>
    </Card>
  );
}

function LearningModuleList({
  learningModules,
  learningPlanId,
}: LearningModuleListProps) {
  return (
    <div className={"space-y-4"}>
      <div className="flex items-center gap-2">
        <Icon
          name="solar--target-outline"
          type="iconify"
          className="size-5 text-primary"
        />
        <h2 className="text-lg font-semibold text-foreground">학습 목표</h2>
        <span className="text-sm text-muted-foreground">
          ({learningModules.length}개)
        </span>
      </div>

      <div className="space-y-3">
        {learningModules.map((learningModule) => (
          <LearningModuleItem
            key={learningModule.id}
            learningModule={learningModule}
            learningPlanId={learningPlanId}
          />
        ))}
      </div>
    </div>
  );
}

export { EmptyLearningModuleList, LearningModuleList };
