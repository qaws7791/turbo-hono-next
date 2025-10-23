import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";

import type { SubGoalDetail } from "@/domains/roadmap/model/types";

import { formatDateTime } from "@/domains/roadmap/model/date";
import { formatSubGoalDueDate } from "@/domains/roadmap/model/format-sub-goal-due-date";

type OverviewTabProps = {
  detail: SubGoalDetail;
};

export function OverviewTab({ detail }: OverviewTabProps) {
  const dueDateLabel = formatSubGoalDueDate(detail.dueDate);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Icon
              name="solar--calendar-outline"
              type="iconify"
              className="size-4 text-primary"
            />
            <h2 className="text-sm font-semibold text-foreground">마감 정보</h2>
          </div>

          {detail.dueDate ? (
            <div>
              <div
                className={`text-lg font-semibold ${
                  dueDateLabel.isOverdue
                    ? "text-destructive"
                    : dueDateLabel.isToday
                      ? "text-orange-600"
                      : dueDateLabel.isUrgent
                        ? "text-yellow-600"
                        : "text-foreground"
                }`}
              >
                {dueDateLabel.text}
              </div>
              {dueDateLabel.formattedDate &&
                dueDateLabel.text !== dueDateLabel.formattedDate && (
                  <div className="text-sm text-muted-foreground">
                    {dueDateLabel.formattedDate}
                  </div>
                )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              마감일이 설정되지 않았습니다.
            </p>
          )}

          <div className="flex items-center gap-2 rounded-md border border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <Icon
              name={
                detail.isCompleted
                  ? "solar--check-circle-outline"
                  : "solar--clock-circle-outline"
              }
              type="iconify"
              className="size-4"
            />
            <span>
              현재 상태:{" "}
              <span className="font-medium text-foreground">
                {detail.isCompleted ? "완료됨" : "진행중"}
              </span>
            </span>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Icon
              name="solar--target-outline"
              type="iconify"
              className="size-4 text-primary"
            />
            <h2 className="text-sm font-semibold text-foreground">
              상위 목표 정보
            </h2>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">로드맵</span>
              <p className="font-medium text-foreground">
                {detail.roadmap.title}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">목표</span>
              <p className="font-medium text-foreground">{detail.goal.title}</p>
              {detail.goal.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {detail.goal.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <div>목표 순서: {detail.goal.order}</div>
            <div>세부 목표 순서: {detail.order}</div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-4 md:w-1/2">
        <div className="flex items-center gap-2">
          <Icon
            name="solar--history-outline"
            type="iconify"
            className="size-4 text-primary"
          />
          <h2 className="text-sm font-semibold text-foreground">기록</h2>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">생성일</span>
            <span className="font-medium text-foreground">
              {formatDateTime(detail.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">마지막 업데이트</span>
            <span className="font-medium text-foreground">
              {formatDateTime(detail.updatedAt)}
            </span>
          </div>
        </div>
      </Card>

      {detail.memo && (
        <Card className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Icon
              name="solar--file-text-outline"
              type="iconify"
              className="size-4 text-primary"
            />
            <h2 className="text-sm font-semibold text-foreground">메모</h2>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {detail.memo}
          </p>
        </Card>
      )}
    </>
  );
}
