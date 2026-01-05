import { useSearchParams } from "react-router";

export type ConceptSearch = {
  query: string;
  setQuery: (nextQuery: string) => void;
};

export function useConceptSearch(initialQuery?: string): ConceptSearch {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = initialQuery ?? "";

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
