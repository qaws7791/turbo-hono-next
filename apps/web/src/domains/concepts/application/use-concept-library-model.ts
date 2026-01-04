import { useSearchParams } from "react-router";

import type { ConceptLibraryFilters } from "../model/types";

export type ConceptLibraryModel = {
  query: string;
  setQuery: (nextQuery: string) => void;
};

export function useConceptLibraryModel(input: {
  filters: ConceptLibraryFilters;
}): ConceptLibraryModel {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = input.filters.q ?? "";

  function setQuery(nextQuery: string): void {
    const next = new URLSearchParams(searchParams);
    if (nextQuery.trim().length === 0) next.delete("q");
    else next.set("q", nextQuery);
    setSearchParams(next, { replace: true });
  }

  return {
    query,
    setQuery,
  };
}
