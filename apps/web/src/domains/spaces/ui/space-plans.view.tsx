import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import type { SpacePlansModel } from "../application/use-space-plans-model";
import type { Space } from "../model/spaces.types";

import {
  PlanStatusBadge,
  getPlanGoalLabel,
  getPlanLevelLabel,
} from "~/domains/plans";

export function SpacePlansView({
  space,
  model,
}: {
  space: Space;
  model: SpacePlansModel;
}) {
  return (
    <div className="space-y-8">
      {/* 학습 계획 목록 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">학습 계획</h2>
          <p className="text-muted-foreground text-sm">
            문서들을 기반으로 학습 계획을 생성해보세요.
          </p>
        </div>
        <Button render={<Link to={`/spaces/${space.id}/plans/new`} />}>
          <IconPlus />
          만들기
        </Button>
      </div>

      {model.plans.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              아직 학습 계획이 없습니다
            </CardTitle>
            <CardDescription>
              문서를 기반으로 AI가 맞춤 학습 계획을 만들어 드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to={`/spaces/${space.id}/plans/new`} />}>
              + 학습 계획 만들기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <div className="flex flex-col gap-3 md:hidden">
            {model.plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/spaces/${space.id}/plan/${plan.id}`}
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
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>계획</TableHead>
                <TableHead>진행률</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {model.plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        to={`/spaces/${space.id}/plan/${plan.id}`}
                        className="font-medium text-base hover:underline block"
                      >
                        {plan.title}
                      </Link>
                      <div className="space-x-1">
                        <Badge variant="outline">
                          {getPlanGoalLabel(plan.goal)}
                        </Badge>
                        <Badge variant="outline">
                          {getPlanLevelLabel(plan.level)}
                        </Badge>
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
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
