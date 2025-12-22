import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Separator } from "@repo/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
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
import { IconCalendar, IconFlame } from "@tabler/icons-react";
import { Link } from "react-router";

import type {
  HomeQueueItem,
  SessionSummaryCard,
  statsForHome,
} from "~/mock/api";
import type { User } from "~/mock/schemas";

import { PageBody } from "~/features/app-shell/page-body";
import { PageHeader } from "~/features/app-shell/page-header";
import {
  getColorByName,
  getIconByName,
} from "~/features/spaces/icon-color-picker";
import { formatLongDateTime, formatShortDate } from "~/lib/time";

function QueueTypeBadge({ type }: { type: "session" | "review" }) {
  return (
    <Badge variant={type === "session" ? "default" : "secondary"}>
      {type === "session" ? "세션" : "복습"}
    </Badge>
  );
}

/**
 * 시간대에 따른 인사 메시지 반환
 */
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

export function HomeView({
  user,
  stats,
  queue,
  recent,
}: {
  user: User | null;
  stats: ReturnType<typeof statsForHome>;
  queue: Array<HomeQueueItem>;
  recent: Array<SessionSummaryCard>;
}) {
  const greeting = getGreetingMessage();
  const userName = user?.name ?? "학습자";

  return (
    <>
      <PageHeader />

      <PageBody className="space-y-12 mt-24">
        <div>
          <h1 className="text-foreground text-3xl font-semibold">
            {greeting}, {userName}
          </h1>
          <p className="text-muted-foreground mt-1 text-xl">
            {stats.coachingMessage}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-muted-foreground">
                남은 할 일
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
              <div className="text-muted-foreground text-xs">
                세션/복습 합산
              </div>
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
          <h2 className="text-xl font-semibold">할 일</h2>
          <div className="mt-4">
            {queue.length === 0 ? (
              <div className="text-muted-foreground space-y-2 text-sm">
                <p>오늘 할 일이 없습니다.</p>
                <p>Space를 만들고 문서를 업로드한 다음, Plan을 생성해보세요.</p>
                <Button render={<Link to="/spaces" />}>Spaces로</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>세션</TableHead>
                    <TableHead>스페이스</TableHead>
                    <TableHead>예정</TableHead>
                    <TableHead>유형</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => {
                    const SpaceIcon = getIconByName(item.spaceIcon);
                    const colorData = getColorByName(item.spaceColor);
                    return (
                      <TableRow key={item.sessionId}>
                        <TableCell>
                          <div className="space-y-0.5">
                            <Link
                              to={`/session?planId=${item.planId}&sessionId=${item.sessionId}`}
                              className="font-medium hover:underline block"
                            >
                              {item.sessionTitle}
                            </Link>
                            <div className="text-muted-foreground text-xs font-medium">
                              {item.planTitle} · {item.durationMinutes}분
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <SpaceIcon
                              className="size-4 shrink-0"
                              style={{ color: colorData?.value }}
                            />
                            <span>{item.spaceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <IconCalendar className="h-4" />
                            <span className="text-sm font-medium">
                              {formatShortDate(item.scheduledDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <QueueTypeBadge type={item.type} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                        <Link
                          to={`/concepts?sessionId=${item.sessionId}`}
                          className="hover:underline"
                        >
                          {item.moduleTitle} · {item.sessionTitle}
                        </Link>
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
              세션 상세 페이지 대신, 세션 요약 카드와 Concept Library로
              복습합니다.
            </div>
          </div>
        </section>
      </PageBody>
    </>
  );
}
