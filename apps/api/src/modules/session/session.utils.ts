import { addDays } from "../../lib/utils/date";

/**
 * 학습 날짜 목록에서 연속 학습 일수를 계산합니다.
 * 오늘 포함하여 연속으로 학습한 일수를 반환합니다.
 */
export function computeStreakDays(
  studyDates: ReadonlyArray<Date>,
  today: Date,
): number {
  if (studyDates.length === 0) return 0;

  const todayStr = today.toISOString().slice(0, 10);
  const sortedDates = studyDates
    .map((d) => d.toISOString().slice(0, 10))
    .sort((a, b) => b.localeCompare(a)); // 최신순 정렬

  // 오늘 학습하지 않았으면 streak 0
  if (sortedDates[0] !== todayStr) {
    // 어제까지 학습했다면 streak 유지
    const yesterday = addDays(today, -1).toISOString().slice(0, 10);
    if (sortedDates[0] !== yesterday) {
      return 0;
    }
  }

  type StreakState = {
    readonly streak: number;
    readonly expectedDate: Date;
    readonly done: boolean;
  };

  const initialState: StreakState = {
    streak: 0,
    expectedDate: today,
    done: false,
  };

  const state = sortedDates.reduce<StreakState>((acc, dateStr) => {
    if (acc.done) return acc;

    const expected = acc.expectedDate.toISOString().slice(0, 10);
    if (dateStr === expected) {
      return {
        streak: acc.streak + 1,
        expectedDate: addDays(acc.expectedDate, -1),
        done: false,
      };
    }

    if (dateStr < expected) {
      return { ...acc, done: true };
    }

    return acc;
  }, initialState);

  return state.streak;
}

/**
 * 남은 작업 수에 따라 코칭 메시지를 생성합니다.
 */
export function generateCoachingMessage(remainingCount: number): string {
  if (remainingCount === 0) {
    return "오늘 할 일을 모두 끝냈어요. 잘했어요!";
  }
  if (remainingCount <= 2) {
    return "조금만 더 하면 오늘 목표를 달성할 수 있어요.";
  }
  return "오늘 할 일부터 차근차근 진행해보세요.";
}
