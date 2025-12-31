import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createConceptReview,
  fetchConcept,
  fetchSpaceConcepts,
  searchConcepts,
} from "./api";

import type {
  ConceptDetail,
  ConceptSearchResponse,
  CreateReviewBody,
  CreateReviewResponse,
  SpaceConceptsResponse,
} from "./types";
import type { ApiError } from "~/modules/api";

const conceptKeys = {
  all: ["concepts"] as const,
  bySpace: (input: {
    spaceId: string;
    page?: number;
    limit?: number;
    search?: string;
    reviewStatus?: "GOOD" | "DUE" | "OVERDUE";
  }) =>
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

export function useSpaceConceptsQuery(input: {
  spaceId: string;
  page?: number;
  limit?: number;
  search?: string;
  reviewStatus?: "GOOD" | "DUE" | "OVERDUE";
}) {
  return useQuery<SpaceConceptsResponse, ApiError>({
    queryKey: conceptKeys.bySpace(input),
    queryFn: () => fetchSpaceConcepts(input),
    enabled: input.spaceId.length > 0,
  });
}

export function useConceptQuery(conceptId: string) {
  return useQuery<ConceptDetail, ApiError>({
    queryKey: conceptKeys.detail(conceptId),
    queryFn: () => fetchConcept(conceptId),
    enabled: conceptId.length > 0,
  });
}

export function useConceptSearchQuery(input: { q: string; enabled?: boolean }) {
  return useQuery<ConceptSearchResponse, ApiError>({
    queryKey: conceptKeys.search(input.q),
    queryFn: () => searchConcepts({ q: input.q }),
    enabled: (input.enabled ?? true) && input.q.trim().length > 0,
  });
}

export function useCreateConceptReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateReviewResponse,
    ApiError,
    { conceptId: string; body: CreateReviewBody }
  >({
    mutationFn: createConceptReview,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: conceptKeys.detail(variables.conceptId),
      });
      await queryClient.invalidateQueries({ queryKey: conceptKeys.all });
    },
  });
}
