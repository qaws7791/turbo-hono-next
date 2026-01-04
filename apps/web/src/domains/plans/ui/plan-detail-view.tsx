import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Progress } from "@repo/ui/progress";
import {
  IconFileDescription,
  IconPlayerPlayFilled,
  IconSettings,
} from "@tabler/icons-react";
import { Link } from "react-router";

import type { PlanDetailModel } from "../application/use-plan-detail-model";
import type { PlanDetailData } from "../model/types";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { PlanStatusBadge } from "~/domains/plans/ui/plan-status-badge";
import {
  getPlanGoalLabel,
  getPlanLevelLabel,
} from "~/domains/spaces/ui/space-plans-view";
import { formatShortDate } from "~/foundation/lib/time";

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
  const { space, plan } = data;

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
      <PageBody className="space-y-10 mt-24 max-w-4xl">
        <div className="flex flex-col gap-4 sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-2xl font-semibold">
                {plan.title}
              </h2>
              <PlanStatusBadge status={plan.status} />
            </div>
            <div className="text-muted-foreground text-sm">
              목표 {getPlanGoalLabel(plan.goal)} · 수준
              {getPlanLevelLabel(plan.level)} · 문서
              {plan.sourceDocumentIds.length}개
            </div>
          </div>

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

          <div className="flex gap-2 flex-row justify-between">
            {model.canStart && model.nextSession ? (
              <Button render={<Link to={model.nextSession.href} />}>
                <IconPlayerPlayFilled />
                세션 시작
              </Button>
            ) : (
              <Button disabled>세션 시작</Button>
            )}

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger render={<Button variant="secondary" />}>
                  <IconFileDescription />
                  참조 자료
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>참조 자료</DialogTitle>
                    <DialogDescription>
                      이 학습 계획이 참조하고 있는 자료 목록입니다.
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="divide-y divide-border max-h-80 overflow-y-auto">
                    {data.sourceMaterials.length === 0 ? (
                      <li className="py-3 text-center text-muted-foreground text-sm">
                        참조 자료가 없습니다.
                      </li>
                    ) : (
                      data.sourceMaterials.map((doc) => (
                        <li
                          key={doc.id}
                          className="py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {doc.title}
                              </div>
                              {doc.summary && (
                                <div className="text-muted-foreground truncate text-xs mt-0.5">
                                  {doc.summary}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="shrink-0"
                            >
                              {doc.kind === "file" ? "파일" : "텍스트"}
                            </Badge>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="secondary" />}>
                  <IconSettings />
                  설정
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {plan.status === "active" ? (
                    <DropdownMenuItem
                      disabled={model.isSubmitting}
                      onSelect={() =>
                        model.fetcher.submit(
                          { intent: "pause" },
                          { method: "post" },
                        )
                      }
                    >
                      일시정지하기
                    </DropdownMenuItem>
                  ) : plan.status === "paused" ? (
                    <DropdownMenuItem
                      disabled={model.isSubmitting}
                      onSelect={() =>
                        model.fetcher.submit(
                          { intent: "resume" },
                          { method: "post" },
                        )
                      }
                    >
                      다시 시작하기
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    disabled={model.isSubmitting}
                    onSelect={() =>
                      model.fetcher.submit(
                        { intent: "archive" },
                        { method: "post" },
                      )
                    }
                  >
                    보관하기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div>
          <div className="pb-3">
            <h2 className="text-base font-medium">학습 커리큘럼</h2>
          </div>
          <div className="space-y-4">
            <Accordion
              multiple
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
                          <div className="truncate text-base font-medium">
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
                            className="p-3 border rounded-lg"
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
          </div>
        </div>
      </PageBody>
    </>
  );
}
