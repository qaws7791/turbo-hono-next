import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Link } from "react-router";

import type { SessionRunDetailResponse } from "../domain";

type SessionRunDetail = SessionRunDetailResponse["data"];

export type SessionCompletedViewProps = {
  detail: SessionRunDetail;
  redirectTo: string;
};

export function SessionCompletedView({
  detail,
  redirectTo,
}: SessionCompletedViewProps) {
  const durationMinutes = detail.endedAt
    ? Math.max(
        0,
        Math.round(
          (new Date(detail.endedAt).getTime() -
            new Date(detail.startedAt).getTime()) /
            60_000,
        ),
      )
    : null;

  return (
    <div className="bg-background text-foreground min-h-svh">
      <div className="mx-auto flex min-h-svh w-full max-w-xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">학습 세션 완료</CardTitle>
            <div className="text-muted-foreground text-xs">
              {detail.session.plan.title} · {detail.session.title}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {detail.status === "COMPLETED" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <span className="text-2xl">🎉</span>
                    <span className="font-semibold">세션을 완료했습니다!</span>
                  </div>
                </div>

                {detail.summary ? (
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      학습 요약
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {detail.summary.summaryMd}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {durationMinutes !== null ? (
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>학습 시간 {durationMinutes}분</span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-1">
                        <span>📝</span>
                        <span>
                          생성된 개념 {detail.summary.conceptsCreatedCount}개
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔄</span>
                        <span>
                          업데이트 {detail.summary.conceptsUpdatedCount}개
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          복습 예약 {detail.summary.reviewsScheduledCount}개
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-border p-4 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">세션이 중단되었습니다.</span>
                  </div>
                  {detail.exitReason ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      사유: {detail.exitReason}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                render={<Link to={redirectTo} />}
              >
                돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
