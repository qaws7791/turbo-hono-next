import type { MaterialProcessingStatus } from "../domain";

export type MaterialListBySpaceKeyInput = {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: MaterialProcessingStatus;
  search?: string;
  sort?: string;
};

export const materialKeys = {
  all: ["materials"] as const,
  listBySpace: (input: MaterialListBySpaceKeyInput) =>
    [
      ...materialKeys.all,
      "space",
      input.spaceId,
      "list",
      input.page ?? 1,
      input.limit ?? 20,
      input.status ?? "ALL",
      input.search ?? "",
      input.sort ?? "",
    ] as const,
};
