import * as React from "react";

import type { SpaceCard } from "../types";

export type SpacesModel = {
  query: string;
  setQuery: (value: string) => void;
  filtered: Array<SpaceCard>;
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
};

export function useSpacesModel(input: {
  spaces: Array<SpaceCard>;
  searchParams: URLSearchParams;
  setSearchParams: (next: URLSearchParams) => void;
}): SpacesModel {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    return input.spaces.filter((space) => {
      if (!normalized) return true;
      return `${space.name} ${space.description ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [input.spaces, normalized]);

  const createOpen = input.searchParams.get("create") === "1";

  const openCreate = React.useCallback(() => {
    const next = new URLSearchParams(input.searchParams);
    next.set("create", "1");
    input.setSearchParams(next);
  }, [input]);

  const closeCreate = React.useCallback(() => {
    const next = new URLSearchParams(input.searchParams);
    next.delete("create");
    input.setSearchParams(next);
  }, [input]);

  return {
    query,
    setQuery,
    filtered,
    createOpen,
    openCreate,
    closeCreate,
  };
}
