export type ConceptLibraryFilters = {
  q?: string;
};

export type ConceptReviewStatus = "due" | "soon" | "good";

export type ConceptLearningLinkType = "CREATED" | "UPDATED" | "REVIEWED";

export type ConceptSource = {
  planId: string;
  planTitle: string;
  sessionRunId: string;
  moduleTitle: string | null;
  sessionTitle: string;
  studiedAt: string;
  linkType: ConceptLearningLinkType;
};

export type ConceptSummary = {
  id: string;
  spaceId: string;
  title: string;
  oneLiner: string;
  tags: Array<string>;
  reviewStatus: ConceptReviewStatus;
  lastStudiedAt?: string;
  latestSource: ConceptSource | null;
};

export type ConceptDetail = Omit<ConceptSummary, "latestSource"> & {
  ariNoteMd: string;
  sources: Array<ConceptSource>;
  relatedConceptIds: Array<string>;
};

export type RelatedConcept = {
  id: string;
  title: string;
  oneLiner: string;
  reviewStatus: ConceptReviewStatus;
};
