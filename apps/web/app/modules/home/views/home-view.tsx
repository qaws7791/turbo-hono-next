import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router";

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
  queue,
  summary,
}: {
  user: AuthUser;
  queue: Array<HomeQueueItem>;
  summary: HomeQueueSummary;
}) {
  const greeting = getGreetingMessage();
  const userName = user.displayName;
  const remainingCount = Math.max(0, summary.total - summary.completed);
  const estimatedMinutes = queue
    .filter((item) => item.status !== "COMPLETED")
    .reduce((sum, item) => sum + item.estimatedMinutes, 0);

  return (
    <>
      <PageHeader />

      <PageBody className="space-y-12 mt-24">
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
              <div className="text-2xl font-semibold">{summary.completed}</div>
              <div className="text-muted-foreground text-xs">
                세션/복습 합산
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-muted-foreground">
                전체 할 일
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <div className="text-muted-foreground text-xs">오늘 기준</div>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold">할 일</h2>
              {queue.length > 0 && (
                <span className="text-lg text-muted-foreground font-medium">
                  {queue.length}
                </span>
              )}
            </div>
            {queue.length > 0 && (
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
            {queue.length === 0 ? (
              <div className="text-muted-foreground space-y-2 text-sm">
                <p>오늘 할 일이 없습니다.</p>
                <p>
                  스페이스를 만들고 문서를 업로드한 다음, 학습 계획을
                  생성해보세요.
                </p>
                <Button render={<Link to="/spaces" />}>스페이스로</Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {queue.slice(0, 3).map((item) => {
                  return (
                    <Link
                      to={`/session?sessionId=${item.sessionId}`}
                      key={item.sessionId}
                    >
                      <Card className="hover:bg-muted h-full">
                        <CardContent className="h-full flex flex-col justify-between">
                          <div>
                            {/* 유형 배지 */}
                            <div>
                              <QueueTypeBadge type={item.sessionType} />
                            </div>
                            {/* 세션 제목 및 계획 정보 */}
                            <div className="mt-4">
                              <span className="font-semibold block text-base">
                                {item.sessionTitle}
                              </span>
                              <div className="text-muted-foreground text-sm">
                                {item.planTitle} · {item.estimatedMinutes}분
                              </div>
                            </div>
                          </div>

                          {/* 스페이스 및 예정일 */}
                          <div className="flex items-center justify-between text-sm mt-4 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {item.spaceName}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {item.status}
                            </span>
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
      </PageBody>
    </>
  );
}
