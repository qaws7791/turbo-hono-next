import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router";

import {
  getEstimatedMinutes,
  getGreetingMessage,
  getRemainingCount,
} from "../domain";

import type { AuthUser } from "~/modules/auth";
import type { HomeQueueItem, HomeQueueSummary } from "~/modules/home";

import { PageBody, PageHeader } from "~/modules/app-shell";

function QueueTypeBadge({ type }: { type: "LEARN" | "REVIEW" }) {
  return (
    <Badge variant={type === "LEARN" ? "default" : "secondary"}>
      {type === "LEARN" ? "세션" : "복습"}
    </Badge>
  );
}

function HomeHeader({
  greeting,
  userName,
  remainingCount,
}: {
  greeting: string;
  userName: string;
  remainingCount: number;
}) {
  return (
    <div>
      <h1 className="text-foreground text-3xl font-semibold">
        {greeting}, {userName}
      </h1>
      <p className="text-muted-foreground mt-1 text-xl">
        {remainingCount === 0
          ? "오늘 할 일을 모두 완료했어요."
          : "오늘 할 일을 하나씩 처리해봅시다."}
      </p>
    </div>
  );
}

function HomeStats({
  remainingCount,
  estimatedMinutes,
  completedCount,
  totalCount,
}: {
  remainingCount: number;
  estimatedMinutes: number;
  completedCount: number;
  totalCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-medium text-muted-foreground">
            남은 할 일
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{remainingCount}</div>
          <div className="text-muted-foreground text-xs">
            예상 {estimatedMinutes}분
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
          <div className="text-2xl font-semibold">{completedCount}</div>
          <div className="text-muted-foreground text-xs">세션/복습 합산</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-medium text-muted-foreground">
            전체 할 일
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{totalCount}</div>
          <div className="text-muted-foreground text-xs">오늘 기준</div>
        </CardContent>
      </Card>
    </div>
  );
}

function HomeQueueHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="text-xl font-semibold">할 일</h2>
        {count > 0 && (
          <span className="text-lg text-muted-foreground font-medium">
            {count}
          </span>
        )}
      </div>
      {count > 0 && (
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
  );
}

function HomeQueueCard({ item }: { item: HomeQueueItem }) {
  const href =
    item.kind === "SESSION"
      ? `/session?sessionId=${item.sessionId}&redirectTo=/home`
      : `/review?conceptId=${item.conceptId}&redirectTo=/home`;

  const title = item.kind === "SESSION" ? item.sessionTitle : item.conceptTitle;

  const subtitle =
    item.kind === "SESSION"
      ? `${item.planTitle} · ${item.estimatedMinutes}분`
      : `복습 · ${item.estimatedMinutes}분`;

  const statusText = item.kind === "SESSION" ? item.status : item.reviewStatus;

  return (
    <Link to={href}>
      <Card className="hover:bg-muted h-full">
        <CardContent className="h-full flex flex-col justify-between">
          <div>
            <div>
              <QueueTypeBadge type={item.sessionType} />
            </div>
            <div className="mt-4">
              <span className="font-semibold block text-base">{title}</span>
              <div className="text-muted-foreground text-sm">{subtitle}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{item.spaceName}</span>
            </div>
            <span className="text-muted-foreground text-xs">{statusText}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function HomeEmptyQueue() {
  return (
    <div className="text-muted-foreground space-y-2 text-sm">
      <p>오늘 할 일이 없습니다.</p>
      <p>스페이스를 만들고 문서를 업로드한 다음, 학습 계획을 생성해보세요.</p>
      <Button render={<Link to="/spaces" />}>스페이스로</Button>
    </div>
  );
}

function HomeQueueSection({ queue }: { queue: Array<HomeQueueItem> }) {
  return (
    <section>
      <HomeQueueHeader count={queue.length} />
      <div className="mt-4">
        {queue.length === 0 ? (
          <HomeEmptyQueue />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {queue.slice(0, 3).map((item) => (
              <HomeQueueCard
                key={item.kind === "SESSION" ? item.sessionId : item.conceptId}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function HomeView({
  user,
  queue,
  summary,
}: {
  user: AuthUser;
  queue: Array<HomeQueueItem>;
  summary: HomeQueueSummary;
}) {
  const greeting = getGreetingMessage();
  const userName = user.displayName;
  const remainingCount = getRemainingCount(summary);
  const estimatedMinutes = getEstimatedMinutes(queue);

  return (
    <>
      <PageHeader />

      <PageBody className="space-y-12 mt-24">
        <HomeHeader
          greeting={greeting}
          userName={userName}
          remainingCount={remainingCount}
        />

        <HomeStats
          remainingCount={remainingCount}
          estimatedMinutes={estimatedMinutes}
          completedCount={summary.completed}
          totalCount={summary.total}
        />

        <HomeQueueSection queue={queue} />
      </PageBody>
    </>
  );
}
