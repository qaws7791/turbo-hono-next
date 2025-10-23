import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";

import type { Goal } from "@/features/roadmap/model/types";

import { GoalItem } from "@/features/roadmap/components/goal-item";

interface GoalListProps {
  goals: Array<Goal>;
  roadmapId: string;
}

function EmptyGoalList() {
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
          이 로드맵에는 아직 목표가 설정되지 않았습니다.
        </p>
      </div>
    </Card>
  );
}

function GoalList({ goals, roadmapId }: GoalListProps) {
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
          ({goals.length}개)
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            roadmapId={roadmapId}
          />
        ))}
      </div>
    </div>
  );
}

export { EmptyGoalList, GoalList };
