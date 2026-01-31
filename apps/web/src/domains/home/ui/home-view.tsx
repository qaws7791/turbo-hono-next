import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Separator } from "@repo/ui/separator";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@repo/ui/timeline";
import { IconArrowRight, IconCalendar, IconFlame } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { useUser } from "~/domains/auth";
import { homeQueries } from "~/domains/home";
import { getColorByName, getIconByName } from "~/foundation/lib/icon-color";
import { formatLongDateTime, formatShortDate } from "~/foundation/lib/time";

function getGreetingMessage(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "좋은 아침입니다";
  }
  if (hour >= 12 && hour < 18) {
    return "좋은 오후입니다";
  }
  return "좋은 저녁입니다";
}

export function HomeView() {
  const user = useUser();
  const { data: stats } = useSuspenseQuery(homeQueries.getStats());
  const { data: queue } = useSuspenseQuery(homeQueries.getQueue());
  const { data: recent } = useSuspenseQuery(homeQueries.getRecentSessions(6));

  const greeting = getGreetingMessage();

  return (
    <>
      <PageHeader />

      <PageBody className="space-y-12 mt-24">
        <div>
          <h1 className="text-foreground text-3xl font-semibold">
            {greeting}, {user.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-xl">
            {stats.coachingMessage}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-muted-foreground">
                남은 세션
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats.remainingCount}
              </div>
              <div className="text-muted-foreground text-xs">
                예상 {stats.estimatedMinutes}분
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-muted-foreground">
                오늘 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats.completedCountToday}
              </div>
              <div className="text-muted-foreground text-xs">완료한 세션</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-muted-foreground">
                연속 학습
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <IconFlame className="text-destructive size-8" />
                <div className="text-2xl font-semibold">
                  {stats.streakDays}일
                </div>
              </div>
              <Progress value={Math.min(100, stats.streakDays * 10)} />
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold">세션</h2>
              {queue.summary.total > 0 && (
                <span className="text-lg text-muted-foreground font-medium">
                  {queue.summary.total}
                </span>
              )}
            </div>
            {queue.summary.total > 0 && (
              <Button
                render={<Link to="/today" />}
                variant="ghost"
                size="sm"
              >
                전체 보기
                <IconArrowRight />
              </Button>
            )}
          </div>
          <div className="mt-4">
            {queue.summary.total === 0 ? (
              <div className="text-muted-foreground space-y-2 text-sm">
                <p>오늘의 세션이 없습니다.</p>
                <p>학습 자료를 업로드하고 학습 계획을 생성해보세요.</p>
                <Button render={<Link to="/plans" />}>학습 계획으로</Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {queue.items.slice(0, 3).map((item) => {
                  const PlanIcon = getIconByName(item.planIcon);
                  const colorData = getColorByName(item.planColor);

                  return (
                    <Link
                      to={item.href}
                      key={item.sessionId}
                    >
                      <Card className="hover:bg-muted h-full">
                        <CardContent className="h-full flex flex-col justify-between">
                          <div>
                            {/* 세션 제목 및 계획 정보 */}

                            <span className="font-semibold block text-base">
                              {item.sessionTitle}
                            </span>
                            <div className="text-muted-foreground text-sm">
                              {item.planTitle} · {item.durationMinutes}분
                            </div>
                          </div>

                          {/* 계획 및 예정일 */}
                          <div className="flex items-center justify-between text-sm mt-4 gap-4">
                            <div className="flex items-center gap-2">
                              <PlanIcon
                                className="size-4 shrink-0"
                                style={{ color: colorData?.value }}
                              />
                              <span className="text-muted-foreground">
                                {item.planTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <IconCalendar className="size-4" />
                              <span>{formatShortDate(item.scheduledDate)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">최근 학습</h2>
          <div className="mt-4">
            {recent.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                최근 완료한 세션이 없습니다.
              </div>
            ) : (
              <Timeline defaultValue={recent.length}>
                {recent.map((item, index) => (
                  <TimelineItem
                    key={item.sessionId}
                    step={index + 1}
                  >
                    <TimelineIndicator className="bg-background flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-muted-foreground/40" />
                    </TimelineIndicator>
                    <TimelineSeparator />
                    <TimelineHeader>
                      <TimelineDate>
                        {formatLongDateTime(item.completedAt)}
                      </TimelineDate>
                      <TimelineTitle>
                        {item.moduleTitle} · {item.sessionTitle}
                      </TimelineTitle>
                    </TimelineHeader>
                    <TimelineContent>
                      <p>{item.moduleTitle}</p>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
            <Separator className="mt-6" />
            <div className="text-muted-foreground text-xs mt-4">
              완료된 세션은 학습 기록에서 확인할 수 있습니다.
            </div>
          </div>
        </section>
      </PageBody>
    </>
  );
}
