import { Badge } from "@repo/ui/badge";
import { Card, CardContent } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Link } from "react-router";

import type { PlanWithDerived } from "~/domains/plans";

import {
  PlanStatusBadge,
  getPlanGoalLabel,
  getPlanLevelLabel,
} from "~/domains/plans";

interface PlanMobileCardProps {
  plan: PlanWithDerived;
  spaceId: string;
}

export function PlanMobileCard({ plan, spaceId }: PlanMobileCardProps) {
  return (
    <Link
      to={`/spaces/${spaceId}/plan/${plan.id}`}
      className="block"
    >
      <Card className="transition-colors hover:bg-muted/50 active:bg-muted">
        <CardContent className="p-4 space-y-3">
          {/* 1행: 제목 + 상태 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-base leading-tight">
              {plan.title}
            </h3>
            <PlanStatusBadge status={plan.status} />
          </div>

          {/* 2행: 메타 배지들 */}
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className="text-xs"
            >
              {getPlanGoalLabel(plan.goal)}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs"
            >
              {getPlanLevelLabel(plan.level)}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs"
            >
              {plan.sourceMaterialIds.length}개의 문서
            </Badge>
          </div>

          {/* 3행: 진행률 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{plan.totalSessions}개 세션</span>
              <span>{plan.progressPercent}%</span>
            </div>
            <Progress
              value={plan.progressPercent}
              className="h-1.5"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
