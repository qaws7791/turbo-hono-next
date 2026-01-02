import type { ConceptReviewStatus } from "../domain";

export type ConceptsBySpaceKeyInput = {
  spaceId: string;
  page?: number;
  limit?: number;
  search?: string;
  reviewStatus?: ConceptReviewStatus;
};

export const conceptKeys = {
  all: ["concepts"] as const,
  bySpace: (input: ConceptsBySpaceKeyInput) =>
    [
      ...conceptKeys.all,
      "space",
      input.spaceId,
      "list",
      input.page ?? 1,
      input.limit ?? 20,
      input.search ?? "",
      input.reviewStatus ?? "ALL",
    ] as const,
  detail: (conceptId: string) =>
    [...conceptKeys.all, "detail", conceptId] as const,
  search: (q: string) => [...conceptKeys.all, "search", q] as const,
};
