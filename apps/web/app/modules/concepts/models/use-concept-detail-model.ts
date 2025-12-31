import { useSearchParams } from "react-router";

export type ConceptDetailTab = "note" | "history" | "related";

export type ConceptDetailModel = {
  activeTab: ConceptDetailTab;
  basePath: string;
  isNoteTab: boolean;
  isHistoryTab: boolean;
  isRelatedTab: boolean;
};

export function useConceptDetailModel(conceptId: string): ConceptDetailModel {
  const [searchParams] = useSearchParams();

  // URL에서 탭 상태 읽기 (기본값: note)
  const tabParam = searchParams.get("tab");
  const activeTab: ConceptDetailTab =
    tabParam === "history" || tabParam === "related" ? tabParam : "note";

  const basePath = `/concept/${conceptId}`;

  return {
    activeTab,
    basePath,
    isNoteTab: activeTab === "note",
    isHistoryTab: activeTab === "history",
    isRelatedTab: activeTab === "related",
  };
}
