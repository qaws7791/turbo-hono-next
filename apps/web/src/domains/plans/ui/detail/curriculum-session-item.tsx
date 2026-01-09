import { Button } from "@repo/ui/button";
import { Link } from "react-router";

import { SessionStatusBadge } from "./session-status-badge";

import type { PlanSession, PlanStatus } from "../../model";

import { formatShortDate } from "~/foundation/lib/time";

type CurriculumSessionItemProps = {
  session: PlanSession;
  planId: string;
  planStatus: PlanStatus;
};

/**
 * 커리큘럼 내 개별 세션 카드
 *
 * - 세션 제목, 일정, 타입 표시
 * - 상태에 따른 버튼 (시작/요약 보기)
 */
export function CurriculumSessionItem({
  session,
  planId,
  planStatus,
}: CurriculumSessionItemProps) {
  const isCompleted = session.status === "completed";
  const canStart = planStatus === "active";

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="truncate text-sm font-medium">{session.title}</div>
          <div className="text-muted-foreground text-xs">
            {formatShortDate(session.scheduledDate)} · {session.durationMinutes}
            분
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SessionStatusBadge status={session.status} />
          {!isCompleted && (
            <Button
              size="sm"
              disabled={!canStart}
              render={
                <Link
                  to={`/session?planId=${planId}&sessionId=${session.id}`}
                />
              }
            >
              시작
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
