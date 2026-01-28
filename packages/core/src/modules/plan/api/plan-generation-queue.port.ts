import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";
import type { PlanGenerationJobData } from "./queue.types";

export type PlanGenerationQueuePort = {
  add: (
    name: "generate-plan",
    data: PlanGenerationJobData,
    options: {
      readonly jobId: string;
      readonly removeOnComplete: boolean;
      readonly removeOnFail: { readonly count: number };
    },
  ) => ResultAsync<void, AppError>;
};
