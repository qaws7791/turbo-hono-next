// 공통 타입 정의

/**
 * 학습 목표 유형
 */
export type PlanGoalType = "JOB" | "CERT" | "WORK" | "HOBBY" | "OTHER";

/**
 * 현재 학습 수준
 */
export type PlanLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * AI 기반 학습 계획 생성에 필요한 입력 정보
 */
export type GeneratePlanInput = {
  readonly userId: string;
  readonly materialIds: ReadonlyArray<string>;
  readonly goalType: PlanGoalType;
  readonly currentLevel: PlanLevel;
  readonly targetDueDate: Date;
  readonly specialRequirements: string | null;
};

/**
 * 자료에서 검색된 관련 청크 정보
 */
export type MaterialContext = {
  readonly materialId: string;
  readonly materialTitle: string;
  readonly content: string;
  readonly chunkIndex: number;
};

/**
 * AI가 생성한 개별 세션 정보
 */
export type GeneratedSession = {
  readonly sessionType: "LEARN";
  readonly title: string;
  readonly objective: string;
  readonly estimatedMinutes: number;
  readonly dayOffset: number; // 시작일로부터의 일 수
  readonly moduleIndex: number; // 모듈 인덱스 (0-based)
};

/**
 * AI가 생성한 개별 모듈 정보
 */
export type GeneratedModule = {
  readonly title: string;
  readonly description: string;
  readonly orderIndex: number;
  readonly materialId: string;
};

/**
 * AI가 생성한 전체 계획 결과
 */
export type GeneratePlanResult = {
  readonly title: string;
  readonly modules: ReadonlyArray<GeneratedModule>;
  readonly sessions: ReadonlyArray<GeneratedSession>;
  readonly summary: string;
};
