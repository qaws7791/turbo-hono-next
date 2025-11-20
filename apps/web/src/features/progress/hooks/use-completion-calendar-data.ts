import * as React from "react";
import {
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";

import {
  buildActivityMap,
  buildDayActivities,
  calculateMonthTotals,
  formatDateLabel,
} from "../utils/activity-data-formatter";

import { useDailyActivity } from "./use-daily-activity";

import type { CalendarDate } from "@internationalized/date";
import type {
  ActivityItem,
  DailyActivityDay,
} from "@/features/progress/model/types";

const timeZone = getLocalTimeZone();

interface UseCompletionCalendarDataReturn {
  selectedDate: CalendarDate;
  setSelectedDate: (date: CalendarDate) => void;
  visibleDate: CalendarDate;
  setVisibleDate: (date: CalendarDate) => void;
  activityDays: ReadonlyArray<DailyActivityDay>;
  activityMap: Map<string, DailyActivityDay>;
  monthTotals: { completed: number; due: number };
  selectedDay: DailyActivityDay | undefined;
  selectedCompletedCount: number;
  selectedDueCount: number;
  selectedDateLabel: string;
  dayActivities: Array<ActivityItem>;
}

/**
 * 완료된 활동 캘린더 데이터를 관리하는 훅
 */
export const useCompletionCalendarData =
  (): UseCompletionCalendarDataReturn => {
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

    const { data } = useDailyActivity(range);
    const activityData = data;
    const activityItems = activityData?.items;

    const activityDays = React.useMemo<ReadonlyArray<DailyActivityDay>>(
      () => activityItems ?? [],
      [activityItems],
    );

    const activityMap = React.useMemo(
      () => buildActivityMap(activityDays),
      [activityDays],
    );

    const monthTotals = React.useMemo(
      () => calculateMonthTotals(activityDays),
      [activityDays],
    );

    const selectedKey = selectedDate.toString();
    const selectedDay = activityMap.get(selectedKey);
    const selectedCompletedCount = selectedDay?.completed.length ?? 0;
    const selectedDueCount = selectedDay?.due.length ?? 0;
    const selectedDateLabel = formatDateLabel(selectedDate);

    const dayActivities = React.useMemo<Array<ActivityItem>>(
      () => buildDayActivities(selectedDay),
      [selectedDay],
    );

    return {
      selectedDate,
      setSelectedDate,
      visibleDate,
      setVisibleDate,
      activityDays,
      activityMap,
      monthTotals,
      selectedDay,
      selectedCompletedCount,
      selectedDueCount,
      selectedDateLabel,
      dayActivities,
    };
  };
