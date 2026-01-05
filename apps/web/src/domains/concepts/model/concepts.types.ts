export type ConceptLibraryFilters = {
  q?: string;
};

export type ConceptReviewStatus = "due" | "soon" | "good";

export type ConceptSource = {
  planId: string;
  sessionId: string;
  moduleTitle: string;
  sessionTitle: string;
  studiedAt: string;
};

export type Concept = {
  id: string;
  spaceId: string;
  title: string;
  oneLiner: string;
  definition: string;
  exampleCode?: string;
  gotchas: Array<string>;
  tags: Array<string>;
  reviewStatus: ConceptReviewStatus;
  lastStudiedAt?: string;
  sources: Array<ConceptSource>;
  relatedConceptIds: Array<string>;
};
