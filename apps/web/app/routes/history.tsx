import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Spinner } from "@repo/ui/spinner";
import { Link, useSearchParams } from "react-router";

import type { SessionRunStatus } from "~/modules/session-runs";

import { PageBody, PageHeader } from "~/modules/app-shell";
import { useSessionRunsQuery } from "~/modules/session-runs";

export function meta() {
  return [{ title: "학습 기록" }];
}

function isSessionRunStatus(value: string | null): value is SessionRunStatus {
  return value === "RUNNING" || value === "COMPLETED" || value === "ABANDONED";
}

function StatusBadge({ status }: { status: SessionRunStatus }) {
  const variant =
    status === "COMPLETED"
      ? "default"
      : status === "RUNNING"
        ? "secondary"
        : "outline";
  const label =
    status === "COMPLETED" ? "완료" : status === "RUNNING" ? "진행 중" : "중단";

  return (
    <Badge
      variant={variant}
      className="text-[10px] px-1.5 py-0 h-4"
    >
      {label}
    </Badge>
  );
}

export default function HistoryRoute() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get("status");
  const status = isSessionRunStatus(statusParam) ? statusParam : undefined;

  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const limit = 20;

  const runs = useSessionRunsQuery({ page, limit, status });

  const items = runs.data?.data ?? [];
  const meta = runs.data?.meta;

  return (
    <>
      <PageHeader>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="text-sm font-medium">학습 기록</div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={status ? "outline" : "default"}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("status");
                next.set("page", "1");
                setSearchParams(next, { replace: true });
              }}
            >
              전체
            </Button>
            <Button
              type="button"
              size="sm"
              variant={status === "COMPLETED" ? "default" : "outline"}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("status", "COMPLETED");
                next.set("page", "1");
                setSearchParams(next, { replace: true });
              }}
            >
              완료
            </Button>
            <Button
              type="button"
              size="sm"
              variant={status === "ABANDONED" ? "default" : "outline"}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("status", "ABANDONED");
                next.set("page", "1");
                setSearchParams(next, { replace: true });
              }}
            >
              중단
            </Button>
          </div>
        </div>
      </PageHeader>

      <PageBody className="mt-24 max-w-4xl space-y-4 pb-10">
        {runs.isLoading ? (
          <Card>
            <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              불러오는 중
            </CardContent>
          </Card>
        ) : runs.isError ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                기록을 불러오지 못했습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              잠시 후 다시 시도해주세요.
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기록이 없습니다</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              세션을 완료하거나 중단하면 여기에서 확인할 수 있습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((run) => {
              const sessionHref = `/session?runId=${run.runId}&redirectTo=/history`;
              return (
                <Card key={run.runId}>
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-semibold">
                            {run.sessionTitle}
                          </div>
                          <StatusBadge status={run.status} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {run.spaceName} · {run.planTitle}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(run.startedAt).toLocaleString()}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link to={sessionHref} />}
                      >
                        보기
                      </Button>
                    </div>

                    {run.summary ? (
                      <div className="text-xs text-muted-foreground">
                        생성 {run.summary.conceptsCreatedCount} · 업데이트{" "}
                        {run.summary.conceptsUpdatedCount} · 복습 예약{" "}
                        {run.summary.reviewsScheduledCount}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}

            {meta && meta.total > page * limit ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(page + 1));
                    setSearchParams(next);
                  }}
                >
                  더 보기
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </PageBody>
    </>
  );
}
