import type { Space } from "../model/spaces.types";
import type { ApiSpace } from "./spaces.dto";

export function toSpaceFromApi(apiSpace: ApiSpace): Space {
  return {
    id: apiSpace.id,
    name: apiSpace.name,
    description: apiSpace.description ?? undefined,
    icon: apiSpace.icon,
    color: apiSpace.color,
    createdAt: apiSpace.createdAt,
    updatedAt: apiSpace.updatedAt,
  };
}
