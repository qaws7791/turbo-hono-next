import { getLocalTimeZone } from "@internationalized/date";

import type { CalendarDate } from "@internationalized/date";
import type {
  ActivityItem,
  DailyActivityDay,
} from "@/features/progress/model/types";

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

/**
 * CalendarDate를 포맷된 문자열로 변환 (예: "2024년 11월 20일 수요일")
 */
export const formatDateLabel = (date: CalendarDate): string => {
  return dayFormatter.format(date.toDate(timeZone));
};

/**
 * ISO 날짜 문자열을 포맷된 시간으로 변환 (예: "오후 02:30")
 */
export const formatActivityTime = (isoDate: string): string => {
  return timeFormatter.format(new Date(isoDate));
};

/**
 * 일일 활동 배열을 Map으로 변환하여 O(1) 조회 성능 제공
 */
export const buildActivityMap = (
  activityDays: ReadonlyArray<DailyActivityDay>,
): Map<string, DailyActivityDay> => {
  const map = new Map<string, DailyActivityDay>();
  for (const day of activityDays) {
    map.set(day.date, day);
  }
  return map;
};

/**
 * 월별 완료/마감 예정 과제 수 계산
 */
export const calculateMonthTotals = (
  activityDays: ReadonlyArray<DailyActivityDay>,
): { completed: number; due: number } => {
  return activityDays.reduce<{ completed: number; due: number }>(
    (totals, day) => ({
      completed: totals.completed + day.completed.length,
      due: totals.due + day.due.length,
    }),
    { completed: 0, due: 0 },
  );
};

/**
 * 선택된 날짜의 활동을 완료된 것과 마감 예정을 혼합하여 정렬
 */
export const buildDayActivities = (
  selectedDay: DailyActivityDay | undefined,
): Array<ActivityItem> => {
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
};
