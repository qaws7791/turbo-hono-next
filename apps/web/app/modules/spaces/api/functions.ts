import type {
  CreateSpaceBody,
  Space,
  SpaceDetail,
  UpdateSpaceBody,
} from "../domain";

import { apiClient, unwrap } from "~/modules/api";

export async function fetchSpaces(): Promise<Array<Space>> {
  const result = await apiClient.GET("/api/spaces");
  return unwrap(result).data;
}

export async function fetchSpace(spaceId: string): Promise<SpaceDetail> {
  const result = await apiClient.GET("/api/spaces/{spaceId}", {
    params: { path: { spaceId } },
  });
  return unwrap(result).data;
}

export async function createSpace(body: CreateSpaceBody): Promise<SpaceDetail> {
  const result = await apiClient.POST("/api/spaces", { body });
  return unwrap(result).data;
}

export async function updateSpace(input: {
  spaceId: string;
  body: UpdateSpaceBody;
}): Promise<SpaceDetail> {
  const result = await apiClient.PATCH("/api/spaces/{spaceId}", {
    params: { path: { spaceId: input.spaceId } },
    body: input.body,
  });
  return unwrap(result).data;
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const result = await apiClient.DELETE("/api/spaces/{spaceId}", {
    params: { path: { spaceId } },
  });
  unwrap(result);
}
