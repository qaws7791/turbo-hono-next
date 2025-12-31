import { Badge } from "@repo/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { Link } from "react-router";

import type { PlanDetail, PlanStatus } from "~/modules/plans";
import type { SpaceDetail } from "~/modules/spaces";

import { PageBody, PageHeader } from "~/modules/app-shell";
import { PlanStatusBadge } from "../components/plan-status-badge";
import { getPlanGoalLabel } from "../utils/plan-goal-label";

function levelLabel(level: PlanDetail["currentLevel"]): string {
  const labels: Record<PlanDetail["currentLevel"], string> = {
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
  };
  return labels[level];
}

export function PlanDetailView({
  space,
  plan,
  isSubmitting,
  onActivate,
  onSetStatus,
}: {
  space: SpaceDetail;
  plan: PlanDetail;
  isSubmitting: boolean;
  onActivate: () => void;
  onSetStatus: (status: PlanStatus) => void;
}) {
  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={`/spaces/${space.id}`} />}>
                {space.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{plan.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>

      <PageBody className="mt-24 space-y-6 max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-2xl font-semibold">
                {plan.title}
              </h2>
              <PlanStatusBadge status={plan.status} />
            </div>
            <div className="text-muted-foreground text-sm">
              목표 {getPlanGoalLabel(plan.goalType)} · 수준{" "}
              {levelLabel(plan.currentLevel)} · 목표 기한 {plan.targetDueDate}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onActivate}
              disabled={isSubmitting}
            >
              활성화
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetStatus("PAUSED")}
              disabled={isSubmitting}
            >
              일시정지
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetStatus("COMPLETED")}
              disabled={isSubmitting}
            >
              완료
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSetStatus("ARCHIVED")}
              disabled={isSubmitting}
            >
              보관
            </Button>
          </div>
        </div>

        {plan.specialRequirements ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">특별 요구사항</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm whitespace-pre-wrap">
              {plan.specialRequirements}
            </CardContent>
          </Card>
        ) : null}

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-medium">다음 할 일</div>
          <div className="text-muted-foreground text-sm">
            홈의 오늘 할 일 큐에서 세션을 시작할 수 있습니다.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              render={<Link to="/home" />}
            >
              홈으로
            </Button>
            <Button
              variant="outline"
              render={<Link to="/today" />}
            >
              오늘 할 일
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground text-xs">
          <Badge variant="outline">Note</Badge> 커리큘럼/세션 상세는 API 확장
          이후 노출됩니다.
        </div>
      </PageBody>
    </>
  );
}
