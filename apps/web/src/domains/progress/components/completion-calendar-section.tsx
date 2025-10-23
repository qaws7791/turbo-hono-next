import {
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import { Badge } from "@repo/ui/badge";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
} from "@repo/ui/calendar";
import { Card } from "@repo/ui/card";
import { Icon } from "@repo/ui/icon";
import { twMerge } from "@repo/ui/utils";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import type { CalendarDate } from "@internationalized/date";
import type { IconName } from "@repo/ui/icon";
import type * as HttpClient from "@/api/http-client";

import { dailyActivityQueryOptions } from "@/domains/progress/queries/daily-activity-query-options";
import { Link } from "@/components/link";

type ApiClient = typeof HttpClient.api;
type DailyActivityResponse = Awaited<
  ReturnType<ApiClient["progress"]["daily"]>
>;
type DailyActivityData = NonNullable<DailyActivityResponse["data"]>;
type DailyActivityDay = DailyActivityData["items"][number];
type ActivityItem =
  | (DailyActivityDay["due"][number] & { type: "due" })
  | (DailyActivityDay["completed"][number] & { type: "completed" });
type ActivityType = ActivityItem["type"];

const timeZone = getLocalTimeZone();

const dayFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone,
});

const activityMeta: Record<
  ActivityType,
  {
    label: string;
    icon: IconName;
    badgeVariant: "primary" | "secondary" | "destructive" | "outline";
    badgeClassName?: string;
    timeLabel: string;
  }
> = {
  completed: {
    label: "완료됨",
    icon: "solar--check-circle-bold",
    badgeVariant: "primary",
    timeLabel: "완료 시각",
  },
  due: {
    label: "마감 예정",
    icon: "solar--calendar-outline",
    badgeVariant: "outline",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
    timeLabel: "마감 시각",
  },
};

const formatDate = (date: CalendarDate) => {
  return dayFormatter.format(date.toDate(timeZone));
};

const formatTime = (isoDate: string) => {
  return timeFormatter.format(new Date(isoDate));
};

export function CompletionCalendarSection() {
  const currentDate = React.useMemo(() => today(timeZone), []);

  const [selectedDate, setSelectedDate] = React.useState<CalendarDate>(
    () => currentDate,
  );
  const [visibleDate, setVisibleDate] = React.useState<CalendarDate>(
    () => currentDate,
  );

  const range = React.useMemo(() => {
    const start = startOfMonth(visibleDate).toString();
    const end = endOfMonth(visibleDate).toString();

    return { start, end };
  }, [visibleDate]);

  const { data } = useQuery(dailyActivityQueryOptions(range));
  const activityData: DailyActivityData | undefined = data?.data;
  const activityItems = activityData?.items;

  const activityDays = React.useMemo<Array<DailyActivityDay>>(
    () => activityItems ?? [],
    [activityItems],
  );

  const activityMap = React.useMemo(() => {
    const map = new Map<string, DailyActivityDay>();
    for (const day of activityDays) {
      map.set(day.date, day);
    }
    return map;
  }, [activityDays]);

  const monthTotals = React.useMemo(() => {
    return activityDays.reduce<{ completed: number; due: number }>(
      (totals, day) => ({
        completed: totals.completed + day.completed.length,
        due: totals.due + day.due.length,
      }),
      { completed: 0, due: 0 },
    );
  }, [activityDays]);

  const selectedKey = selectedDate.toString();
  const selectedDay = activityMap.get(selectedKey);
  const selectedCompletedCount = selectedDay?.completed.length ?? 0;
  const selectedDueCount = selectedDay?.due.length ?? 0;
  const selectedDateLabel = formatDate(selectedDate);

  const dayActivities = React.useMemo<Array<ActivityItem>>(() => {
    if (!selectedDay) return [];

    const dueItems = [...selectedDay.due].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );
    const completedItems = [...selectedDay.completed].sort((a, b) =>
      a.completedAt.localeCompare(b.completedAt),
    );

    return [
      ...dueItems.map((item) => ({ type: "due" as const, ...item })),
      ...completedItems.map((item) => ({
        type: "completed" as const,
        ...item,
      })),
    ];
  }, [selectedDay]);

  const renderCell = React.useCallback(
    (date: CalendarDate) => {
      const key = date.toString();
      const day = activityMap.get(key);
      const completedCount = day?.completed.length ?? 0;
      const dueCount = day?.due.length ?? 0;
      const hasActivity = completedCount + dueCount > 0;
      const totalCount = completedCount + dueCount;

      return (
        <CalendarCell
          key={key}
          date={date}
          className={({ isSelected, isDisabled }) =>
            twMerge(
              "flex-col gap-1 text-sm group",
              hasActivity && !isDisabled && !isSelected && "text-primary",
            )
          }
        >
          {({ formattedDate }) => (
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <span className="font-medium">{formattedDate}</span>
              {hasActivity ? (
                <div className="flex flex-wrap items-center justify-center gap-1 text-[0.65rem] font-semibold">
                  {totalCount > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 group-data-[selected=true]:bg-white" />
                  )}
                </div>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
              )}
            </div>
          )}
        </CalendarCell>
      );
    },
    [activityMap],
  );

  return (
    <div className="w-75">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="sr-only">목표 활동 캘린더</h2>
          <p className="sr-only">
            날짜를 선택해 해당 날짜에 마감되거나 완료된 세부 목표를 확인하세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              이번 달 완료된 목표:{" "}
              <span className="font-semibold text-foreground">
                {monthTotals.completed}
              </span>
              개
            </span>
            <span>
              이번 달 마감 예정 목표:{" "}
              <span className="font-semibold text-foreground">
                {monthTotals.due}
              </span>
              개
            </span>
          </div>
        </div>
        <Calendar
          aria-label="목표 활동 캘린더"
          value={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setVisibleDate(date);
          }}
          focusedValue={visibleDate}
          onFocusChange={setVisibleDate}
        >
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>{(date) => renderCell(date)}</CalendarGridBody>
          </CalendarGrid>
        </Calendar>

        <Card className="flex-1 border border-border/60 bg-muted/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-muted-foreground">
              {selectedDateLabel}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary">
                완료 {selectedCompletedCount}개
              </span>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">
                마감 {selectedDueCount}개
              </span>
            </div>
          </div>

          <div className="mt-4">
            {dayActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                선택한 날짜에는 완료되거나 마감 예정인 세부 목표가 없습니다.
                캘린더에서 다른 날짜를 선택해보세요.
              </p>
            ) : (
              <ul className="space-y-3">
                {dayActivities.map((activity) => {
                  const meta = activityMeta[activity.type];
                  if (!meta) {
                    return null;
                  }

                  return (
                    <li key={`${activity.type}-${activity.subGoalId}`}>
                      <Link
                        to="/app/roadmaps/$roadmapId/sub-goals/$subGoalId"
                        params={{
                          roadmapId: activity.roadmapId,
                          subGoalId: activity.subGoalId,
                        }}
                        className="group block focus-visible:outline-none"
                      >
                        <Card className="flex items-start justify-between gap-4 border border-border/70 bg-background/95 p-4 transition-colors hover:border-primary/50 hover:bg-primary/5 group-focus-visible:border-primary group-focus-visible:shadow-sm">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={meta.badgeVariant}
                                className={twMerge(
                                  "px-2.5 py-0.5",
                                  meta.badgeClassName,
                                )}
                              >
                                <span className="flex items-center gap-1.5 text-xs font-semibold">
                                  <Icon
                                    name={meta.icon}
                                    type="iconify"
                                    className="size-3.5"
                                  />
                                  {meta.label}
                                </span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {meta.timeLabel}:{" "}
                                <span className="font-medium text-foreground">
                                  {formatTime(
                                    activity.type === "due"
                                      ? activity.dueDate
                                      : activity.completedAt,
                                  )}
                                </span>
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {activity.subGoalTitle}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {activity.roadmapTitle} · {activity.goalTitle}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
