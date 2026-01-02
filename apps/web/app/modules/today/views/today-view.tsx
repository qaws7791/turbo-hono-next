import { Badge } from "@repo/ui/badge";
import { Card, CardContent } from "@repo/ui/card";
import { IconChevronLeft } from "@tabler/icons-react";
import { Link } from "react-router";

import { getTodayStats } from "../domain";

import type { HomeQueueItem } from "~/modules/home";

import { PageBody, PageHeader } from "~/modules/app-shell";

/**
 * 세션 유형 배지 컴포넌트
 */
function QueueTypeBadge({ type }: { type: "LEARN" | "REVIEW" }) {
  return (
    <Badge variant={type === "LEARN" ? "default" : "secondary"}>
      {type === "LEARN" ? "세션" : "복습"}
    </Badge>
  );
}

/**
 * 오늘 할 일 페이지 헤더 섹션
 * - 홈으로 돌아가기 링크
 * - 페이지 제목 및 설명
 */
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

/**
 * 오늘 할 일 통계 섹션
 * - 전체, 세션, 복습 개수 표시
 */
function TodayStats({ queue }: { queue: Array<HomeQueueItem> }) {
  const { totalCount, sessionCount, reviewCount } = getTodayStats(queue);

  return (
    <div className="flex gap-6">
      <div className="text-sm">
        <span className="text-muted-foreground">전체</span>{" "}
        <span className="font-medium">{totalCount}개</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">세션</span>{" "}
        <span className="font-medium">{sessionCount}개</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">복습</span>{" "}
        <span className="font-medium">{reviewCount}개</span>
      </div>
    </div>
  );
}

/**
 * 할 일이 없을 때 표시되는 빈 상태 컴포넌트
 */
function TodayEmptyState() {
  return (
    <div className="text-muted-foreground space-y-2 text-sm py-12 text-center">
      <p className="text-lg">오늘 할 일이 없습니다 🎉</p>
      <p>스페이스를 만들고 문서를 업로드한 다음, 학습 계획을 생성해보세요.</p>
    </div>
  );
}

/**
 * 개별 할 일 아이템 카드 컴포넌트
 */
function TodayQueueItem({ item }: { item: HomeQueueItem }) {
  const href =
    item.kind === "SESSION"
      ? `/session?sessionId=${item.sessionId}&redirectTo=/today`
      : `/review?conceptId=${item.conceptId}&redirectTo=/today`;

  const title = item.kind === "SESSION" ? item.sessionTitle : item.conceptTitle;

  const subtitle =
    item.kind === "SESSION"
      ? `${item.planTitle} · ${item.estimatedMinutes}분`
      : `복습 · ${item.estimatedMinutes}분`;

  const statusText = item.kind === "SESSION" ? item.status : item.reviewStatus;

  return (
    <Card className="group">
      <CardContent>
        {/* 유형 배지 */}
        <div>
          <QueueTypeBadge type={item.sessionType} />
        </div>
        {/* 세션 제목 및 계획 정보 */}
        <div className="pt-3">
          <Link
            to={href}
            className="font-semibold hover:underline block text-base group-hover:text-primary transition-colors"
          >
            {title}
          </Link>
          <div className="text-muted-foreground text-sm">{subtitle}</div>
        </div>

        {/* 스페이스 및 상태 */}
        <div className="flex items-center justify-between text-sm mt-6">
          <span className="text-muted-foreground">{item.spaceName}</span>
          <span className="text-muted-foreground text-xs">{statusText}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 할 일 목록 컴포넌트
 * - 빈 상태 또는 할 일 카드 그리드 표시
 */
function TodayQueueList({ queue }: { queue: Array<HomeQueueItem> }) {
  if (queue.length === 0) {
    return <TodayEmptyState />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {queue.map((item) => (
        <TodayQueueItem
          key={item.kind === "SESSION" ? item.sessionId : item.conceptId}
          item={item}
        />
      ))}
    </div>
  );
}

/**
 * 오늘 할 일 페이지 메인 뷰 컴포넌트
 */
export function TodayView({ queue }: { queue: Array<HomeQueueItem> }) {
  return (
    <>
      <PageHeader />

      <PageBody className="space-y-8 mt-24">
        <TodayHeader />
        <TodayStats queue={queue} />
        <section>
          <TodayQueueList queue={queue} />
        </section>
      </PageBody>
    </>
  );
}
