import type { ApiSpace } from "./spaces.dto";
import type { Space } from "../model/spaces.types";

export function toSpaceFromApi(apiSpace: ApiSpace): Space {
  return {
    id: apiSpace.id,
    name: apiSpace.name,
    description: apiSpace.description ?? undefined,
    icon: apiSpace.icon ?? "book",
    color: apiSpace.color ?? "blue",
    createdAt: apiSpace.createdAt,
    updatedAt: apiSpace.updatedAt,
    activePlanId: undefined,
  };
}
