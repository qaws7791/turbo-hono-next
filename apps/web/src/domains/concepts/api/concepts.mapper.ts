import type {
  ConceptDetail,
  ConceptReviewStatus,
  ConceptSource,
  ConceptSummary,
  RelatedConcept,
} from "../model/concepts.types";
import type { ApiConceptDetail, ApiConceptListItem } from "./concepts.dto";

export function toConceptReviewStatusFromApi(
  status: ApiConceptListItem["reviewStatus"],
): ConceptReviewStatus {
  if (status === "OVERDUE") return "due";
  if (status === "DUE") return "soon";
  return "good";
}

function toConceptSourceFromApi(source: {
  sessionRunId: string;
  linkType: "CREATED" | "UPDATED" | "REVIEWED";
  date: string;
  planId: string;
  planTitle: string;
  moduleTitle: string | null;
  sessionTitle: string;
}): ConceptSource {
  return {
    planId: source.planId,
    planTitle: source.planTitle,
    sessionRunId: source.sessionRunId,
    moduleTitle: source.moduleTitle,
    sessionTitle: source.sessionTitle,
    studiedAt: source.date,
    linkType: source.linkType,
  };
}

export function toConceptFromApiListItem(
  spaceId: string,
  item: ApiConceptListItem,
): ConceptSummary {
  return {
    id: item.id,
    spaceId,
    title: item.title,
    oneLiner: item.oneLiner,
    tags: item.tags,
    reviewStatus: toConceptReviewStatusFromApi(item.reviewStatus),
    lastStudiedAt: item.lastLearnedAt ?? undefined,
    latestSource: item.latestSource
      ? toConceptSourceFromApi(item.latestSource)
      : null,
  };
}

export function toConceptFromApiDetail(
  detail: ApiConceptDetail,
): ConceptDetail {
  const sources = detail.learningHistory.map(toConceptSourceFromApi);
  const lastStudiedAt = sources[0]?.studiedAt;

  return {
    id: detail.id,
    spaceId: detail.spaceId,
    title: detail.title,
    oneLiner: detail.oneLiner,
    ariNoteMd: detail.ariNoteMd,
    tags: detail.tags,
    reviewStatus: toConceptReviewStatusFromApi(detail.reviewStatus),
    lastStudiedAt,
    sources,
    relatedConceptIds: detail.relatedConcepts.map((c) => c.id),
  };
}

export function toRelatedConceptFromApi(
  item: ApiConceptDetail["relatedConcepts"][number],
): RelatedConcept {
  return {
    id: item.id,
    title: item.title,
    oneLiner: item.oneLiner,
    reviewStatus: toConceptReviewStatusFromApi(item.reviewStatus),
  };
}
