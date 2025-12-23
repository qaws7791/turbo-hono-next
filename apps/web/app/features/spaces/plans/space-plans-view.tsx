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
import {
  IconChevronRight,
  IconPlayerPlay,
  IconPlus,
} from "@tabler/icons-react";
import { Link } from "react-router";

import type { PlanGoal, PlanLevel, Space } from "~/mock/schemas";
import type { SpacePlansModel } from "./use-space-plans-model";

import { PlanStatusBadge } from "~/features/plans/plan-status-badge";

function getPlanGoalLabel(goal: PlanGoal) {
  const labels: Record<PlanGoal, string> = {
    career: "취업/이직",
    certificate: "자격증",
    work: "업무 활용",
    hobby: "자기계발/취미",
  };
  return labels[goal];
}

function getPlanLevelLabel(level: PlanLevel) {
  const labels: Record<PlanLevel, string> = {
    novice: "입문",
    basic: "초급",
    intermediate: "중급",
    advanced: "고급",
  };
  return labels[level];
}

export function SpacePlansView({
  space,
  model,
}: {
  space: Space;
  model: SpacePlansModel;
}) {
  const completedCount = model.activePlan
    ? Math.round(
        (model.activePlan.progressPercent / 100) *
          model.activePlan.totalSessions,
      )
    : 0;

  return (
    <div className="space-y-20">
      {/* 오늘의 세션 카드 - 개요 탭에서 이동됨 */}
      <div className="border rounded-3xl p-4 sm:py-6 sm:px-4">
        <div className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <h2 className="font-semibold">{model.activePlan?.title}</h2>
            <p className="sr-only">오늘의 학습 세션입니다.</p>
          </div>
          {model.activePlan && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-2"
              render={
                <Link to={`/spaces/${space.id}/plan/${model.activePlan.id}`} />
              }
            >
              상세 보기 <IconChevronRight />
            </Button>
          )}
        </div>
        <div className="space-y-8 mt-4">
          {model.activePlan ? (
            <>
              {/* 학습 계획 정보 + 진행률 배지 + 프로그레스 바 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-medium truncate">
                      {model.nextSession?.moduleTitle}
                    </div>
                  </div>
                  <span className="font-medium">
                    {model.activePlan.progressPercent}% · {completedCount}/
                    {model.activePlan.totalSessions}
                  </span>
                </div>
                <Progress
                  value={model.activePlan.progressPercent}
                  className="h-1.5"
                />
              </div>

              {/* 다음 세션 정보 (평탄화: 중첩 카드 제거) */}
              {model.nextSession && (
                <div className="grid gap-4">
                  <div className="flex justify-between gap-4 p-4 border rounded-xl flex-col items-start sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {model.nextSession.sessionTitle}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-xs shrink-0"
                        >
                          {model.nextSession.type === "review"
                            ? "복습"
                            : "다음 세션"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0"
                        >
                          {model.nextSession.durationMinutes}분
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="w-full sm:w-auto"
                      render={
                        <Link
                          to={`/session?planId=${model.activePlan.id}&sessionId=${model.nextSession.sessionId}`}
                        />
                      }
                    >
                      <IconPlayerPlay />
                      시작하기
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">
                아직 활성화된 학습 계획이 없습니다. 문서를 기반으로 학습 계획을
                생성해보세요.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  render={<Link to={`/spaces/${space.id}/documents`} />}
                >
                  문서 업로드
                </Button>
                <Button
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  variant="outline"
                  render={<Link to={`/spaces/${space.id}/plans/new`} />}
                >
                  학습 계획 만들기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

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
          <Table>
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
                        className="font-medium text-lg hover:underline block"
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
                          {plan.sourceDocumentIds.length}개의 문서
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
        )}
      </div>
    </div>
  );
}
