import { useSearchParams } from "react-router";

export type ConceptTab = "note" | "history" | "related";

export type ConceptTabs = {
  activeTab: ConceptTab;
  basePath: string;
  isNoteTab: boolean;
  isHistoryTab: boolean;
  isRelatedTab: boolean;
};

export function useConceptTabs(conceptId: string): ConceptTabs {
  const [searchParams] = useSearchParams();

  // URL에서 탭 상태 읽기 (기본값: note)
  const tabParam = searchParams.get("tab");
  const activeTab: ConceptTab =
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
