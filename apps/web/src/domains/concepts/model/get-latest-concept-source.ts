import type { ConceptSource } from "./concepts.types";

export type ConceptWithSources = { sources: Array<ConceptSource> };

export function getLatestConceptSource(
  concept: ConceptWithSources,
): ConceptSource | null {
  const sources = concept.sources
    .slice()
    .sort((a, b) => b.studiedAt.localeCompare(a.studiedAt));
  return sources[0] ?? null;
}
