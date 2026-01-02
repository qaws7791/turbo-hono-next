import type { PlanStatus } from "../domain";

export type PlansBySpaceKeyInput = {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: PlanStatus;
};

export const planKeys = {
  all: ["plans"] as const,
  bySpace: (input: PlansBySpaceKeyInput) =>
    [
      ...planKeys.all,
      "space",
      input.spaceId,
      "list",
      input.page ?? 1,
      input.limit ?? 20,
      input.status ?? "ALL",
    ] as const,
  detail: (planId: string) => [...planKeys.all, "detail", planId] as const,
};
