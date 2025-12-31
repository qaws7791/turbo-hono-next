export type ConceptReviewStatus = "GOOD" | "DUE" | "OVERDUE";

export type ConceptListItem = {
  id: string;
  title: string;
  oneLiner: string;
  tags: Array<string>;
  reviewStatus: ConceptReviewStatus;
  srsDueAt: string | null;
  lastLearnedAt: string | null;
};

export type ConceptsListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SpaceConceptsResponse = {
  data: Array<ConceptListItem>;
  meta: ConceptsListMeta;
};

export type ConceptLinkType = "CREATED" | "UPDATED" | "REVIEWED";

export type ConceptDetail = {
  id: string;
  title: string;
  oneLiner: string;
  ariNoteMd: string;
  tags: Array<string>;
  relatedConcepts: Array<{ id: string; title: string }>;
  learningHistory: Array<{
    sessionRunId: string;
    linkType: ConceptLinkType;
    date: string;
  }>;
  srsState: { interval: number; ease: number; dueAt: string } | null;
};

export type ConceptDetailResponse = {
  data: ConceptDetail;
};

export type ConceptSearchItem = {
  id: string;
  spaceId: string;
  title: string;
  oneLiner: string;
};

export type ConceptSearchResponse = {
  data: Array<ConceptSearchItem>;
};

export type ConceptReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type CreateReviewBody = {
  rating: ConceptReviewRating;
  sessionRunId?: string;
};

export type CreateReviewResponse = {
  data: { nextDueAt: string; newInterval: number };
};

// Library Filters (from features)
export type ConceptLibraryFilters = {
  q?: string;
};
