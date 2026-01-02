import { useQuery } from "@tanstack/react-query";

import { fetchSpaceMaterials } from "../api";

import { materialKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { SpaceMaterialsResponse } from "../domain";
import type { MaterialListBySpaceKeyInput } from "./keys";

export function useSpaceMaterialsQuery(input: MaterialListBySpaceKeyInput) {
  return useQuery<SpaceMaterialsResponse, ApiError>({
    queryKey: materialKeys.listBySpace(input),
    queryFn: () => fetchSpaceMaterials(input),
    enabled: input.spaceId.length > 0,
  });
}
