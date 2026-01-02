import type {
  ConceptDetailApiResponse,
  ConceptSearchApiResponse,
  CreateConceptReviewApiBody,
  CreateConceptReviewApiResponse,
  SpaceConceptsApiResponse,
} from "../api/schema";

export type ConceptListItem = SpaceConceptsApiResponse["data"][number];

export type ConceptReviewStatus = ConceptListItem["reviewStatus"];

export type ConceptsListMeta = SpaceConceptsApiResponse["meta"];

export type SpaceConceptsResponse = SpaceConceptsApiResponse;

export type ConceptDetail = ConceptDetailApiResponse["data"];

export type ConceptDetailResponse = ConceptDetailApiResponse;

export type ConceptLinkType = NonNullable<
  ConceptDetail["learningHistory"]
>[number]["linkType"];

export type ConceptSearchItem = ConceptSearchApiResponse["data"][number];

export type ConceptSearchResponse = ConceptSearchApiResponse;

export type ConceptReviewRating = CreateConceptReviewApiBody["rating"];

export type CreateReviewBody = CreateConceptReviewApiBody;

export type CreateReviewResponse = CreateConceptReviewApiResponse;

// Library Filters (from features)
export type ConceptLibraryFilters = {
  q?: string;
};
