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
import { Separator } from "@repo/ui/separator";
import { Link } from "react-router";

import type { HomeQueueItem } from "~/mock/api";
import type { Document, DocumentStatus, Plan, Space } from "~/mock/schemas";
import type { SpaceOverviewModel } from "./use-space-overview-model";

import { PlanStatusBadge } from "~/features/plans/plan-status-badge";
import { formatLongDateTime } from "~/lib/time";

export type SpaceOverviewData = {
  space: Space;
  documentCount: number;
  planCount: number;
  activePlan:
    | (Plan & { progressPercent: number; totalSessions: number })
    | null;
  nextQueue: Array<HomeQueueItem>;
  latestDocument: Document | null;
};

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  if (status === "completed")
    return <Badge variant="secondary">completed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function SpaceOverviewView({
  data,
  model,
}: {
  data: SpaceOverviewData;
  model: SpaceOverviewModel;
}) {
  const { space, documentCount, planCount, nextQueue } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3 gap-0">
            <CardTitle className="text-sm">문서</CardTitle>
            <CardDescription>업로드된 자료</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-right">
              {documentCount}개
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 gap-0">
            <CardTitle className="text-sm">학습 계획</CardTitle>
            <CardDescription>생성된 학습 계획</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-right">
              {planCount}개
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 gap-0">
            <CardTitle className="text-sm">오늘 할 일</CardTitle>
            <CardDescription>활성화된 학습 계획 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-right">
              {nextQueue.length}개
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">Active Plan</CardTitle>
            {model.activePlan ? (
              <PlanStatusBadge status={model.activePlan.status} />
            ) : (
              <Badge variant="outline">없음</Badge>
            )}
          </div>
          <CardDescription>
            빠른 실행을 위해 요약과 시작 버튼만 제공합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {model.activePlan ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium truncate">
                    {model.activePlan.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {model.activePlan.progressPercent}%
                  </div>
                </div>
                <Progress value={model.activePlan.progressPercent} />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {model.nextSession ? (
                  <Button
                    className="flex-1"
                    render={
                      <Link
                        to={`/session?planId=${model.activePlan.id}&sessionId=${model.nextSession.sessionId}`}
                      />
                    }
                  >
                    세션 시작
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    variant="outline"
                    disabled
                  >
                    오늘 할 일 없음
                  </Button>
                )}
                <Button
                  className="flex-1"
                  variant="outline"
                  render={
                    <Link
                      to={`/spaces/${space.id}/plan/${model.activePlan.id}`}
                    />
                  }
                >
                  Plan 상세
                </Button>
              </div>

              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">다음 큐</div>
                {nextQueue.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    예정된 세션이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {nextQueue.map((item) => (
                      <div
                        key={item.sessionId}
                        className="rounded-xl border border-border p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {item.sessionTitle}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {item.moduleTitle} · {item.durationMinutes}분
                            </div>
                          </div>
                          <Badge
                            variant={
                              item.type === "session" ? "default" : "secondary"
                            }
                          >
                            {item.type === "session" ? "세션" : "복습"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">
                아직 Active Plan이 없습니다. 문서를 기반으로 Plan을
                생성해보세요.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  render={<Link to={`/spaces/${space.id}/documents`} />}
                >
                  문서 업로드
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  render={<Link to={`/spaces/${space.id}/plans/new`} />}
                >
                  Plan 만들기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 활동</CardTitle>
          <CardDescription>
            가장 최근 업로드/분석 항목을 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {model.latestDocument ? (
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="truncate text-sm font-medium">
                    {model.latestDocument.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatLongDateTime(model.latestDocument.createdAt)}
                  </div>
                </div>
                <DocumentStatusBadge status={model.latestDocument.status} />
              </div>
              {model.latestDocument.summary ? (
                <div className="text-muted-foreground mt-2 text-sm">
                  {model.latestDocument.summary}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              아직 업로드된 문서가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
