import type { Concept } from "./concepts.types";

export type ConceptSource = Concept["sources"][number];

export function getLatestConceptSource(concept: Concept): ConceptSource | null {
  const sources = concept.sources
    .slice()
    .sort((a, b) => b.studiedAt.localeCompare(a.studiedAt));
  return sources[0] ?? null;
}
