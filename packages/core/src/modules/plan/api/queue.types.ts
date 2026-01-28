/**
 * Plan 생성 작업 데이터
 */
export type PlanGenerationJobData = {
  readonly userId: string;
  readonly planId: number;
  readonly publicId: string;
  readonly materialIds: ReadonlyArray<string>;
  readonly targetDueDate: string | null;
  readonly specialRequirements: string | null;
  readonly icon: string;
  readonly color: string;
};

/**
 * Plan 생성 작업 결과
 */
export type PlanGenerationJobResult = {
  readonly planId: number;
  readonly publicId: string;
  readonly title: string;
  readonly status: "ACTIVE" | "FAILED";
  readonly moduleCount?: number;
  readonly sessionCount?: number;
};

/**
 * Plan 생성 진행 상황
 */
export type PlanGenerationProgress = {
  readonly step:
    | "VALIDATING"
    | "GENERATING"
    | "CREATING_MODULES"
    | "CREATING_SESSIONS"
    | "FINALIZING"
    | "COMPLETED";
  readonly progress: number;
  readonly message?: string;
};
