import { apiClient } from "./client";
import { ApiError } from "./error";

import type { paths } from "~/types/api";

type MaterialsListOk =
  paths["/api/spaces/{spaceId}/materials"]["get"]["responses"]["200"]["content"]["application/json"];

export async function listMaterials(
  spaceId: string,
  query?: paths["/api/spaces/{spaceId}/materials"]["get"]["parameters"]["query"],
): Promise<MaterialsListOk> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/materials",
    { params: { path: { spaceId }, query } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list materials", response.status, error);
  }
  return data;
}
