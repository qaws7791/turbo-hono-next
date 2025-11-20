/**
 * Progress Mappers
 *
 * API 응답 타입을 도메인 모델로 변환하는 함수들
 */

import type {
  ApiCompletedLearningTask,
  ApiDailyActivityData,
  ApiDailyActivityDay,
  ApiDueLearningTask,
} from "@/features/progress/api/types";
import type {
  CompletedLearningTask,
  DailyActivity,
  DailyActivityDay,
  DueLearningTask,
} from "@/features/progress/model/types";

/**
 * API DailyActivityDay를 도메인 DailyActivityDay로 변환
 *
 * @param apiDay - API 응답 day 객체
 * @returns 도메인 DailyActivityDay 모델
 */
export function mapApiDayToDailyActivityDay(
  apiDay: ApiDailyActivityDay,
): DailyActivityDay {
  return {
    date: apiDay.date,
    due: apiDay.due.map(
      (item: ApiDueLearningTask): DueLearningTask => ({
        learningTaskId: item.learningTaskId,
        learningPlanId: item.learningPlanId,
        learningTaskTitle: item.learningTaskTitle,
        learningPlanTitle: item.learningPlanTitle,
        learningModuleTitle: item.learningModuleTitle,
        dueDate: item.dueDate,
      }),
    ),
    completed: apiDay.completed.map(
      (item: ApiCompletedLearningTask): CompletedLearningTask => ({
        learningTaskId: item.learningTaskId,
        learningPlanId: item.learningPlanId,
        learningTaskTitle: item.learningTaskTitle,
        learningPlanTitle: item.learningPlanTitle,
        learningModuleTitle: item.learningModuleTitle,
        completedAt: item.completedAt,
      }),
    ),
  };
}

/**
 * API DailyActivityData를 도메인 DailyActivity로 변환
 *
 * @param apiData - API 응답 data 객체
 * @returns 도메인 DailyActivity 모델
 */
export function mapApiDataToDailyActivity(
  apiData: ApiDailyActivityData,
): DailyActivity {
  return {
    items: apiData.items.map(mapApiDayToDailyActivityDay),
  };
}
