import { useSearchParams } from "react-router";

import { getLatestConceptSource } from "../model";

import type { Concept } from "../model";

export type ConceptDetailTab = "note" | "history" | "related";

export type ConceptDetailModel = {
  latestSource: ReturnType<typeof getLatestConceptSource>;
  reviewHref: string | null;
  activeTab: ConceptDetailTab;
  basePath: string;
  isNoteTab: boolean;
  isHistoryTab: boolean;
  isRelatedTab: boolean;
};

export function useConceptDetailModel(concept: Concept): ConceptDetailModel {
  const [searchParams] = useSearchParams();
  const latestSource = getLatestConceptSource(concept);
  const reviewHref = latestSource
    ? `/session?runId=${latestSource.sessionId}`
    : null;

  // URL에서 탭 상태 읽기 (기본값: note)
  const tabParam = searchParams.get("tab");
  const activeTab: ConceptDetailTab =
    tabParam === "history" || tabParam === "related" ? tabParam : "note";

  const basePath = `/concept/${concept.id}`;

  return {
    latestSource,
    reviewHref,
    activeTab,
    basePath,
    isNoteTab: activeTab === "note",
    isHistoryTab: activeTab === "history",
    isRelatedTab: activeTab === "related",
  };
}
