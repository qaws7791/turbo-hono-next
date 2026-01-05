import * as React from "react";

import type { SpaceCard } from "../model/spaces.types";

export type SpaceSearch = {
  query: string;
  setQuery: (value: string) => void;
  filtered: Array<SpaceCard>;
};

export function useSpaceSearch(spaces: Array<SpaceCard>): SpaceSearch {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    return spaces.filter((space) => {
      if (!normalized) return true;
      return `${space.name} ${space.description ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [spaces, normalized]);

  return {
    query,
    setQuery,
    filtered,
  };
}
