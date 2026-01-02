import { useQuery } from "@tanstack/react-query";

import { fetchSpace, fetchSpaces } from "../api";

import { spaceKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { Space, SpaceDetail } from "../domain";

export function useSpacesQuery() {
  return useQuery<Array<Space>, ApiError>({
    queryKey: spaceKeys.list(),
    queryFn: fetchSpaces,
  });
}

export function useSpaceQuery(spaceId: string) {
  return useQuery<SpaceDetail, ApiError>({
    queryKey: spaceKeys.detail(spaceId),
    queryFn: () => fetchSpace(spaceId),
    enabled: spaceId.length > 0,
  });
}
