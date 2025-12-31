import { Badge } from "@repo/ui/badge";
import { Card, CardContent } from "@repo/ui/card";
import { IconChevronLeft } from "@tabler/icons-react";
import { Link } from "react-router";

import type { HomeQueueItem } from "~/modules/home";

import { PageBody, PageHeader } from "~/modules/app-shell";

function QueueTypeBadge({ type }: { type: "LEARN" | "REVIEW" }) {
  return (
    <Badge variant={type === "LEARN" ? "default" : "secondary"}>
      {type === "LEARN" ? "세션" : "복습"}
    </Badge>
  );
}

export function TodayView({ queue }: { queue: Array<HomeQueueItem> }) {
  return (
    <>
      <PageHeader />

      <PageBody className="space-y-8 mt-24">
        {/* 헤더 영역 */}
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

        {/* 통계 */}
        <div className="flex gap-6">
          <div className="text-sm">
            <span className="text-muted-foreground">전체</span>{" "}
            <span className="font-medium">{queue.length}개</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">세션</span>{" "}
            <span className="font-medium">
              {queue.filter((q) => q.sessionType === "LEARN").length}개
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">복습</span>{" "}
            <span className="font-medium">
              {queue.filter((q) => q.sessionType === "REVIEW").length}개
            </span>
          </div>
        </div>

        {/* 할 일 목록 */}
        <section>
          {queue.length === 0 ? (
            <div className="text-muted-foreground space-y-2 text-sm py-12 text-center">
              <p className="text-lg">오늘 할 일이 없습니다 🎉</p>
              <p>
                스페이스를 만들고 문서를 업로드한 다음, 학습 계획을
                생성해보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {queue.map((item) => {
                return (
                  <Card
                    key={item.sessionId}
                    className="group"
                  >
                    <CardContent>
                      {/* 유형 배지 */}
                      <div>
                        <QueueTypeBadge type={item.sessionType} />
                      </div>
                      {/* 세션 제목 및 계획 정보 */}
                      <div className="pt-3">
                        <Link
                          to={`/session?sessionId=${item.sessionId}`}
                          className="font-semibold hover:underline block text-base group-hover:text-primary transition-colors"
                        >
                          {item.sessionTitle}
                        </Link>
                        <div className="text-muted-foreground text-sm">
                          {item.planTitle} · {item.estimatedMinutes}분
                        </div>
                      </div>

                      {/* 스페이스 및 예정일 */}
                      <div className="flex items-center justify-between text-sm mt-6">
                        <span className="text-muted-foreground">
                          {item.spaceName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {item.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </PageBody>
    </>
  );
}
