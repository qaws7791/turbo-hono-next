import { useQuery } from "@tanstack/react-query";

import { fetchConcept, fetchSpaceConcepts, searchConcepts } from "../api";

import { conceptKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type {
  ConceptDetail,
  ConceptSearchResponse,
  SpaceConceptsResponse,
} from "../domain";
import type { ConceptsBySpaceKeyInput } from "./keys";

export function useSpaceConceptsQuery(input: ConceptsBySpaceKeyInput) {
  return useQuery<SpaceConceptsResponse, ApiError>({
    queryKey: conceptKeys.bySpace(input),
    queryFn: () => fetchSpaceConcepts(input),
    enabled: input.spaceId.length > 0,
  });
}

export function useConceptQuery(conceptId: string) {
  return useQuery<ConceptDetail, ApiError>({
    queryKey: conceptKeys.detail(conceptId),
    queryFn: () => fetchConcept(conceptId),
    enabled: conceptId.length > 0,
  });
}

export function useConceptSearchQuery(input: { q: string; enabled?: boolean }) {
  return useQuery<ConceptSearchResponse, ApiError>({
    queryKey: conceptKeys.search(input.q),
    queryFn: () => searchConcepts({ q: input.q }),
    enabled: (input.enabled ?? true) && input.q.trim().length > 0,
  });
}
