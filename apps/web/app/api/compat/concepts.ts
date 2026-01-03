import type { Concept, ConceptReviewStatus } from "~/mock/schemas";
import type { paths } from "~/types/api";

import { nowIso } from "~/lib/time";

type ApiConceptListItem =
  paths["/api/spaces/{spaceId}/concepts"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

type ApiConceptDetail =
  paths["/api/concepts/{conceptId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export function mapApiReviewStatus(
  status: "GOOD" | "DUE" | "OVERDUE",
): ConceptReviewStatus {
  if (status === "OVERDUE") return "due";
  if (status === "DUE") return "soon";
  return "good";
}

export function toUiConceptFromListItem(
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
    reviewStatus: mapApiReviewStatus(item.reviewStatus),
    lastStudiedAt: item.lastLearnedAt ?? nowIso(),
    sources: [],
    relatedConceptIds: [],
  };
}

export function toUiConceptFromDetail(
  spaceId: string,
  detail: ApiConceptDetail,
): Concept {
  const reviewStatus = (() => {
    const dueAt = detail.srsState?.dueAt;
    if (!dueAt) return "good" as const;
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime())) return "good" as const;
    const diffMs = due.getTime() - Date.now();
    if (diffMs <= 0) return "due" as const;
    if (diffMs <= 3 * 24 * 60 * 60 * 1000) return "soon" as const;
    return "good" as const;
  })();

  const lastStudiedAt =
    detail.learningHistory
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? nowIso();

  return {
    id: detail.id,
    spaceId,
    title: detail.title,
    oneLiner: detail.oneLiner,
    definition: detail.ariNoteMd,
    exampleCode: undefined,
    gotchas: [],
    tags: detail.tags,
    reviewStatus,
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
