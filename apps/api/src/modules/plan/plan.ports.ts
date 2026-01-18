// No imports needed from plan.dto for these types

export type PlanGenerationRequest = {
  readonly userId: string;
  readonly materialIds: ReadonlyArray<string>;
  readonly targetDueDate: Date | null;
  readonly specialRequirements: string | null;
  readonly requestedSessionCount: number | null;
};

export type PlanGenerationResult = {
  readonly title: string;
  readonly summary: string;
  readonly modules: ReadonlyArray<{
    readonly title: string;
    readonly description: string;
    readonly orderIndex: number;
    readonly materialId: string;
  }>;
  readonly sessions: ReadonlyArray<{
    readonly sessionType: "LEARN";
    readonly title: string;
    readonly objective: string;
    readonly estimatedMinutes: number;
    readonly moduleIndex: number;
    readonly dayOffset: number;
    readonly sourceReferences: ReadonlyArray<{
      readonly materialId: string;
      readonly chunkRange: {
        readonly start: number;
        readonly end: number;
      };
    }>;
  }>;
};

export type PlanGenerationPort = {
  generatePlan: (input: PlanGenerationRequest) => Promise<PlanGenerationResult>;
};
