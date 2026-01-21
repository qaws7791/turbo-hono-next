import { Progress } from "@repo/ui/progress";

import type { PlanWithDerived } from "../../model";

type PlanProgressSectionProps = {
  plan: PlanWithDerived;
};

/**
 * 플랜 진행률 섹션
 *
 * - 진행률 바
 * - 총 세션 수 및 완료율 표시
 */
export function PlanProgressSection({ plan }: PlanProgressSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          진행률 - 총 {plan.totalSessions}개 세션
        </div>
        <div className="text-muted-foreground text-sm font-medium">
          {plan.progressPercent}%
        </div>
      </div>
      <Progress value={plan.progressPercent} />
    </div>
  );
}
