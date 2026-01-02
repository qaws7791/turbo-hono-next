import type { ConceptDetail } from "./types";

export type ConceptDetailTab = "note" | "history" | "related";

export function parseConceptDetailTab(
  tabParam: string | null,
): ConceptDetailTab {
  if (tabParam === "history" || tabParam === "related") return tabParam;
  return "note";
}

export function sortLearningHistoryNewestFirst(
  history: ReadonlyArray<ConceptDetail["learningHistory"][number]>,
): Array<ConceptDetail["learningHistory"][number]> {
  return [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
