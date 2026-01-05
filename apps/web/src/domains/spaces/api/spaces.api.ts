import { toSpaceFromApi } from "./spaces.mapper";

import type { CreateSpaceBody, UpdateSpaceBody } from "./spaces.dto";
import type { Space } from "../model/spaces.types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export async function listSpaces(): Promise<Array<Space>> {
  const { data, error, response } = await apiClient.GET("/api/spaces");
  if (!response.ok || !data) {
    throw new ApiError("Failed to list spaces", response.status, error);
  }
  return data.data.map((item) => toSpaceFromApi(item));
}

export async function createSpace(input: CreateSpaceBody): Promise<Space> {
  const { data, error, response } = await apiClient.POST("/api/spaces", {
    body: input,
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to create space", response.status, error);
  }
  return toSpaceFromApi(data.data);
}

export async function getSpace(spaceId: string): Promise<Space> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}",
    { params: { path: { spaceId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to get space", response.status, error);
  }
  return toSpaceFromApi(data.data);
}

export async function updateSpace(
  spaceId: string,
  input: UpdateSpaceBody,
): Promise<Space> {
  const { data, error, response } = await apiClient.PATCH(
    "/api/spaces/{spaceId}",
    { params: { path: { spaceId } }, body: input },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to update space", response.status, error);
  }
  return toSpaceFromApi(data.data);
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/api/spaces/{spaceId}", {
    params: { path: { spaceId } },
  });
  if (!response.ok) {
    throw new ApiError("Failed to delete space", response.status, error);
  }
}
