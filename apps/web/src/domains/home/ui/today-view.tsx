import { Badge } from "@repo/ui/badge";
import { Card, CardContent } from "@repo/ui/card";
import { IconCalendar, IconChevronLeft } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import type { HomeQueue, HomeQueueItem } from "../model/types";

import { PageBody, PageHeader } from "~/domains/app-shell";
import { homeQueries } from "~/domains/home/home.queries";
import { getColorByName, getIconByName } from "~/domains/spaces";
import { formatShortDate } from "~/foundation/lib/time";

export function TodayView() {
  const { data: queue } = useSuspenseQuery(homeQueries.getQueue());

  return (
    <>
      <PageHeader />

      <PageBody className="space-y-8 mt-24">
        <TodayHeader />
        <TodayStats queue={queue} />
        <TodayQueueList items={queue.items} />
      </PageBody>
    </>
  );
}

function TodayHeader() {
  return (
    <div className="space-y-2">
      <Link
        to="/home"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        <IconChevronLeft className="size-4" />
        <span>홈으로</span>
      </Link>
      <h1 className="text-foreground text-3xl font-semibold">오늘 할 일</h1>
      <p className="text-muted-foreground">
        오늘 완료해야 할 모든 학습 세션과 복습 목록입니다.
      </p>
    </div>
  );
}

function TodayStats({ queue }: { queue: HomeQueue }) {
  const { summary } = queue;

  return (
    <div className="flex gap-6">
      <div className="text-sm">
        <span className="text-muted-foreground">전체</span>{" "}
        <span className="font-medium">{summary.total}개</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">완료</span>{" "}
        <span className="font-medium">{summary.completed}개</span>
      </div>
    </div>
  );
}

function TodayQueueList({ items }: { items: Array<HomeQueueItem> }) {
  if (items.length === 0) {
    return <TodayEmptyState />;
  }

  return (
    <section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <TodayQueueItem
            key={item.kind === "SESSION" ? item.sessionId : item.conceptId}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

function TodayEmptyState() {
  return (
    <div className="text-muted-foreground space-y-2 text-sm py-12 text-center">
      <p className="text-lg">오늘 할 일이 없습니다 🎉</p>
      <p>스페이스를 만들고 문서를 업로드한 다음, 학습 계획을 생성해보세요.</p>
    </div>
  );
}

function TodayQueueItem({ item }: { item: HomeQueueItem }) {
  const SpaceIcon = getIconByName(item.spaceIcon);
  const colorData = getColorByName(item.spaceColor);
  const title = item.kind === "SESSION" ? item.sessionTitle : item.conceptTitle;
  const subtitle =
    item.kind === "SESSION"
      ? `${item.planTitle} · ${item.durationMinutes}분`
      : `개념 복습 · ${item.durationMinutes}분`;

  return (
    <Card className="group">
      <CardContent>
        {/* 유형 배지 */}
        <div>
          <QueueTypeBadge type={item.type} />
        </div>

        {/* 세션 제목 및 계획 정보 */}
        <div className="pt-3">
          <Link
            to={item.href}
            className="font-semibold hover:underline block text-base group-hover:text-primary transition-colors"
          >
            {title}
          </Link>
          <div className="text-muted-foreground text-sm">{subtitle}</div>
        </div>

        {/* 스페이스 및 예정일 */}
        <div className="flex items-center justify-between text-sm mt-6">
          <div className="flex items-center gap-2">
            <SpaceIcon
              className="size-4 shrink-0"
              style={{ color: colorData?.value }}
            />
            <span className="text-muted-foreground">{item.spaceName}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <IconCalendar className="size-4" />
            <span>{formatShortDate(item.scheduledDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueueTypeBadge({ type }: { type: "session" | "review" }) {
  const label = type === "session" ? "세션" : "복습";
  const variant = type === "session" ? "default" : "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}
