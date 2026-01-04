import { apiClient } from "./client";
import { ApiError } from "./error";

import type { paths } from "~/foundation/types/api";

type ConceptListOk =
  paths["/api/spaces/{spaceId}/concepts"]["get"]["responses"]["200"]["content"]["application/json"];
type ConceptDetailOk =
  paths["/api/concepts/{conceptId}"]["get"]["responses"]["200"]["content"]["application/json"];

export async function listSpaceConcepts(
  spaceId: string,
  query?: paths["/api/spaces/{spaceId}/concepts"]["get"]["parameters"]["query"],
): Promise<ConceptListOk> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/concepts",
    { params: { path: { spaceId }, query } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list concepts", response.status, error);
  }
  return data;
}

export async function getConceptDetail(
  conceptId: string,
): Promise<ConceptDetailOk> {
  const { data, error, response } = await apiClient.GET(
    "/api/concepts/{conceptId}",
    { params: { path: { conceptId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to get concept detail", response.status, error);
  }
  return data;
}
