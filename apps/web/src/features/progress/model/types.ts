/**
 * Progress Domain Models
 *
 * API 응답 구조와 독립적인 비즈니스 엔티티 정의
 */

/**
 * 활동 타입
 */
export type ActivityType = "due" | "completed";

/**
 * 마감 예정 학습 태스크
 */
export interface DueLearningTask {
  readonly learningTaskId: string;
  readonly learningPlanId: string;
  readonly learningTaskTitle: string;
  readonly learningPlanTitle: string;
  readonly learningModuleTitle: string;
  readonly dueDate: string;
}

/**
 * 완료된 학습 태스크
 */
export interface CompletedLearningTask {
  readonly learningTaskId: string;
  readonly learningPlanId: string;
  readonly learningTaskTitle: string;
  readonly learningPlanTitle: string;
  readonly learningModuleTitle: string;
  readonly completedAt: string;
}

/**
 * 활동 아이템 (마감 또는 완료)
 */
export type ActivityItem =
  | (DueLearningTask & { readonly type: "due" })
  | (CompletedLearningTask & { readonly type: "completed" });

/**
 * 특정 날짜의 활동 데이터
 */
export interface DailyActivityDay {
  readonly date: string;
  readonly due: ReadonlyArray<DueLearningTask>;
  readonly completed: ReadonlyArray<CompletedLearningTask>;
}

/**
 * 일일 활동 데이터
 */
export interface DailyActivity {
  readonly items: ReadonlyArray<DailyActivityDay>;
}

/**
 * 일일 활동 조회 파라미터
 */
export interface DailyActivityParams {
  readonly start: string;
  readonly end: string;
}
