import type { paths } from "~/types/api";

export type SpaceConceptsResponse =
  paths["/api/spaces/{spaceId}/concepts"]["get"]["responses"][200]["content"]["application/json"];

export type ConceptListItem = SpaceConceptsResponse["data"][number];
export type ConceptsListMeta = SpaceConceptsResponse["meta"];

export type ConceptDetailResponse =
  paths["/api/concepts/{conceptId}"]["get"]["responses"][200]["content"]["application/json"];

export type ConceptDetail = ConceptDetailResponse["data"];

export type ConceptSearchResponse =
  paths["/api/concepts/search"]["get"]["responses"][200]["content"]["application/json"];

export type ConceptSearchItem = ConceptSearchResponse["data"][number];

export type CreateReviewBody = NonNullable<
  paths["/api/concepts/{conceptId}/reviews"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreateReviewResponse =
  paths["/api/concepts/{conceptId}/reviews"]["post"]["responses"][201]["content"]["application/json"];

// Library Filters (from features)
export type ConceptLibraryFilters = {
  q?: string;
};
