import { apiClient } from "./client";
import { ApiError } from "./error";

import type { paths } from "~/foundation/types/api";

type Space =
  paths["/api/spaces"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

export async function listSpaces(): Promise<Array<Space>> {
  const { data, error, response } = await apiClient.GET("/api/spaces");
  if (!response.ok || !data) {
    throw new ApiError("Failed to list spaces", response.status, error);
  }
  return data.data;
}

export async function createSpace(input: {
  name: string;
  description?: string;
}): Promise<Space> {
  const { data, error, response } = await apiClient.POST("/api/spaces", {
    body: input,
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to create space", response.status, error);
  }
  return data.data;
}

export async function getSpace(spaceId: string): Promise<Space> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}",
    {
      params: { path: { spaceId } },
    },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to get space", response.status, error);
  }
  return data.data;
}

export async function updateSpace(
  spaceId: string,
  input: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
  },
): Promise<Space> {
  const { data, error, response } = await apiClient.PATCH(
    "/api/spaces/{spaceId}",
    {
      params: { path: { spaceId } },
      body: input,
    },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to update space", response.status, error);
  }
  return data.data;
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/api/spaces/{spaceId}", {
    params: { path: { spaceId } },
  });
  if (!response.ok) {
    throw new ApiError("Failed to delete space", response.status, error);
  }
}
