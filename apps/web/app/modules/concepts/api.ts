import type {
  ConceptDetail,
  ConceptSearchResponse,
  CreateReviewBody,
  CreateReviewResponse,
  SpaceConceptsResponse,
} from "./types";

import { apiClient, unwrap } from "~/modules/api";

export async function fetchSpaceConcepts(input: {
  spaceId: string;
  page?: number;
  limit?: number;
  search?: string;
  reviewStatus?: "GOOD" | "DUE" | "OVERDUE";
}): Promise<SpaceConceptsResponse> {
  const result = await apiClient.GET("/api/spaces/{spaceId}/concepts", {
    params: {
      path: { spaceId: input.spaceId },
      query: {
        page: input.page,
        limit: input.limit,
        search: input.search,
        reviewStatus: input.reviewStatus,
      },
    },
  });
  return unwrap(result);
}

export async function searchConcepts(input: {
  q: string;
  spaceIds?: Array<string>;
}): Promise<ConceptSearchResponse> {
  const result = await apiClient.GET("/api/concepts/search", {
    params: {
      query: {
        q: input.q,
        spaceIds: input.spaceIds,
      },
    },
  });
  return unwrap(result);
}

export async function fetchConcept(conceptId: string): Promise<ConceptDetail> {
  const result = await apiClient.GET("/api/concepts/{conceptId}", {
    params: { path: { conceptId } },
  });
  return unwrap(result).data;
}

export async function createConceptReview(input: {
  conceptId: string;
  body: CreateReviewBody;
}): Promise<CreateReviewResponse> {
  const result = await apiClient.POST("/api/concepts/{conceptId}/reviews", {
    params: { path: { conceptId: input.conceptId } },
    body: input.body,
  });
  return unwrap(result);
}
