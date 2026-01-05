import type { ApiConceptDetail, ApiConceptListItem } from "./concepts.dto";
import type { Concept, ConceptReviewStatus } from "../model/concepts.types";

export function toConceptReviewStatusFromApi(
  status: ApiConceptListItem["reviewStatus"],
): ConceptReviewStatus {
  if (status === "OVERDUE") return "due";
  if (status === "DUE") return "soon";
  return "good";
}

export function toConceptFromApiListItem(
  spaceId: string,
  item: ApiConceptListItem,
): Concept {
  return {
    id: item.id,
    spaceId,
    title: item.title,
    oneLiner: item.oneLiner,
    definition: "",
    exampleCode: undefined,
    gotchas: [],
    tags: item.tags,
    reviewStatus: toConceptReviewStatusFromApi(item.reviewStatus),
    lastStudiedAt: item.lastLearnedAt ?? undefined,
    sources: [],
    relatedConceptIds: [],
  };
}

function toReviewStatusFromDueAt(
  dueAt: string | null | undefined,
): ConceptReviewStatus {
  if (!dueAt) return "good";
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return "good";

  const diffMs = due.getTime() - Date.now();
  if (diffMs <= 0) return "due";
  if (diffMs <= 3 * 24 * 60 * 60 * 1000) return "soon";
  return "good";
}

export function toConceptFromApiDetail(
  spaceId: string,
  detail: ApiConceptDetail,
): Concept {
  const lastStudiedAt = detail.learningHistory
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;

  return {
    id: detail.id,
    spaceId,
    title: detail.title,
    oneLiner: detail.oneLiner,
    definition: detail.ariNoteMd,
    exampleCode: undefined,
    gotchas: [],
    tags: detail.tags,
    reviewStatus: toReviewStatusFromDueAt(detail.srsState?.dueAt),
    lastStudiedAt,
    sources: detail.learningHistory.map((h) => ({
      planId: "",
      sessionId: h.sessionRunId,
      moduleTitle: "학습 세션",
      sessionTitle: "세션 기록",
      studiedAt: h.date,
    })),
    relatedConceptIds: detail.relatedConcepts.map((c) => c.id),
  };
}
