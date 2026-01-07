import { Badge } from "@repo/ui/badge";
import { Progress } from "@repo/ui/progress";
import { TableCell, TableRow } from "@repo/ui/table";
import { Link } from "react-router";

import type { PlanWithDerived } from "~/domains/plans";

import {
  PlanStatusBadge,
  getPlanGoalLabel,
  getPlanLevelLabel,
} from "~/domains/plans";

interface PlanTableRowProps {
  plan: PlanWithDerived;
  spaceId: string;
}

export function PlanTableRow({ plan, spaceId }: PlanTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <Link
            to={`/spaces/${spaceId}/plan/${plan.id}`}
            className="font-medium text-base hover:underline block"
          >
            {plan.title}
          </Link>
          <div className="space-x-1">
            <Badge variant="outline">{getPlanGoalLabel(plan.goal)}</Badge>
            <Badge variant="outline">{getPlanLevelLabel(plan.level)}</Badge>
            <Badge variant="outline">
              {plan.sourceMaterialIds.length}개의 문서
            </Badge>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1 min-w-32">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{plan.totalSessions}개 세션</span>
            <span>{plan.progressPercent}%</span>
          </div>
          <Progress
            value={plan.progressPercent}
            className="h-1.5"
          />
        </div>
      </TableCell>
      <TableCell>
        <PlanStatusBadge status={plan.status} />
      </TableCell>
    </TableRow>
  );
}
