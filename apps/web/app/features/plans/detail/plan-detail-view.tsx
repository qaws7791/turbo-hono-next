import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
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

import { PlanStatusBadge } from "../plan-status-badge";

import type { PlanDetailData } from "./types";
import type { PlanDetailModel } from "./use-plan-detail-model";

import { formatShortDate } from "~/lib/time";

function SessionStatusBadge({
  status,
}: {
  status: "todo" | "in_progress" | "completed";
}) {
  if (status === "completed") return <Badge variant="secondary">완료됨</Badge>;
  return <Badge variant="outline">할 일</Badge>;
}

export function PlanDetailView({
  data,
  model,
}: {
  data: PlanDetailData;
  model: PlanDetailModel;
}) {
  const { space, plan, nextQueue } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">
            <Link
              to={`/spaces/${space.id}`}
              className="hover:text-foreground underline underline-offset-4"
            >
              {space.name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-xl font-semibold">
              {plan.title}
            </h2>
            <PlanStatusBadge status={plan.status} />
          </div>
          <div className="text-muted-foreground text-sm">
            목표 {plan.goal} · 수준 {plan.level} · 문서{" "}
            {plan.sourceDocumentIds.length}개
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {model.canStart && model.nextSession ? (
            <Button
              render={
                <Link
                  to={`/session?planId=${plan.id}&sessionId=${model.nextSession.sessionId}`}
                />
              }
            >
              세션 시작
            </Button>
          ) : (
            <Button disabled>세션 시작</Button>
          )}

          {plan.status === "active" ? (
            <model.fetcher.Form method="post">
              <input
                type="hidden"
                name="intent"
                value="pause"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={model.isSubmitting}
              >
                일시정지
              </Button>
            </model.fetcher.Form>
          ) : plan.status === "paused" ? (
            <model.fetcher.Form method="post">
              <input
                type="hidden"
                name="intent"
                value="resume"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={model.isSubmitting}
              >
                다시 시작
              </Button>
            </model.fetcher.Form>
          ) : (
            <Button
              variant="outline"
              disabled
            >
              보관됨
            </Button>
          )}

          <model.fetcher.Form method="post">
            <input
              type="hidden"
              name="intent"
              value="archive"
            />
            <Button
              type="submit"
              variant="ghost"
              disabled={model.isSubmitting}
            >
              보관
            </Button>
          </model.fetcher.Form>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">오늘 / 다음 실행 큐</CardTitle>
          <CardDescription>
            1~3개만 노출하고 “시작”으로 수렴합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextQueue.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              아직 시작할 세션이 없습니다.
            </div>
          ) : (
            nextQueue.map((item) => (
              <div
                key={item.sessionId}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {item.moduleTitle} · {item.sessionTitle}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatShortDate(item.scheduledDate)} ·{" "}
                      {item.durationMinutes}분 ·{" "}
                      {item.type === "session" ? "세션" : "복습"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    render={
                      <Link
                        to={`/session?planId=${plan.id}&sessionId=${item.sessionId}`}
                      />
                    }
                  >
                    시작
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">진행률</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-xs">
              총 {plan.totalSessions}개 세션
            </div>
            <div className="text-muted-foreground text-xs">
              {plan.progressPercent}%
            </div>
          </div>
          <Progress value={plan.progressPercent} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">학습 커리큘럼</CardTitle>
          <CardDescription>
            단순한 아코디언으로 학습 경로를 안내합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion
            defaultValue={[]}
            className="w-full"
          >
            {plan.modules.map((module) => {
              const total = module.sessions.length;
              const completed = module.sessions.filter(
                (s) => s.status === "completed",
              ).length;
              const percent =
                total === 0 ? 0 : Math.round((completed / total) * 100);

              return (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                >
                  <AccordionTrigger>
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {module.title}
                        </div>
                        {module.summary ? (
                          <div className="text-muted-foreground truncate text-xs">
                            {module.summary}
                          </div>
                        ) : null}
                      </div>
                      <Badge variant="outline">{percent}%</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {module.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-xl border border-border p-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 space-y-1">
                              <div className="truncate text-sm font-medium">
                                {session.title}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {formatShortDate(session.scheduledDate)} ·{" "}
                                {session.durationMinutes}분 ·{" "}
                                {session.type === "session" ? "세션" : "복습"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <SessionStatusBadge status={session.status} />
                              {session.status === "completed" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  render={
                                    <Link
                                      to={`/concepts?sessionId=${session.id}`}
                                    />
                                  }
                                >
                                  요약 보기
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={plan.status !== "active"}
                                  render={
                                    <Link
                                      to={`/session?planId=${plan.id}&sessionId=${session.id}`}
                                    />
                                  }
                                >
                                  시작
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <Separator />
          <div className="flex justify-end">
            {model.canStart && model.nextSession ? (
              <Button
                render={
                  <Link
                    to={`/session?planId=${plan.id}&sessionId=${model.nextSession.sessionId}`}
                  />
                }
              >
                다음 세션 시작
              </Button>
            ) : (
              <Button disabled>다음 세션 시작</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
