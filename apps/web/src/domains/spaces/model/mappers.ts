import type { paths } from "~/foundation/types/api";
import type { Space } from "./types";

type ApiSpace =
  paths["/api/spaces"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

export function toSpaceFromApi(apiSpace: ApiSpace): Space {
  return {
    id: apiSpace.id,
    name: apiSpace.name,
    description: apiSpace.description ?? undefined,
    icon: apiSpace.icon ?? "book",
    color: apiSpace.color ?? "blue",
    createdAt: apiSpace.createdAt,
    updatedAt: apiSpace.updatedAt,
    activePlanId: undefined, // TODO: 백엔드에서 제공 시 연결
  };
}
