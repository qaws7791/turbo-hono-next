import { toMaterialFromApi } from "./materials.mapper";

import type {
  MaterialUploadCompleteAccepted,
  MaterialUploadCompleteBody,
  MaterialUploadCompleteCreated,
  MaterialUploadInitBody,
  MaterialUploadInitOk,
  MaterialsListOk,
  MaterialsListQuery,
} from "./materials.dto";
import type { Material } from "../model/materials.types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export type SpaceMaterialsList = {
  data: Array<Material>;
  meta: MaterialsListOk["meta"];
};

export async function listSpaceMaterials(
  spaceId: string,
  query?: MaterialsListQuery,
): Promise<SpaceMaterialsList> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/materials",
    { params: { path: { spaceId }, query } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list materials", response.status, error);
  }

  return {
    data: data.data.map((item) => toMaterialFromApi(spaceId, item)),
    meta: data.meta,
  };
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    "/api/materials/{materialId}",
    { params: { path: { materialId } } },
  );
  if (!response.ok) {
    throw new ApiError("Failed to delete material", response.status, error);
  }
}

export async function initMaterialUpload(
  spaceId: string,
  input: MaterialUploadInitBody,
): Promise<MaterialUploadInitOk["data"]> {
  const { data, error, response } = await apiClient.POST(
    "/api/spaces/{spaceId}/materials/uploads/init",
    { params: { path: { spaceId } }, body: input },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to init upload", response.status, error);
  }
  return data.data;
}

export async function completeMaterialUpload(
  spaceId: string,
  input: MaterialUploadCompleteBody,
): Promise<
  MaterialUploadCompleteCreated["data"] | MaterialUploadCompleteAccepted["data"]
> {
  const { data, error, response } = await apiClient.POST(
    "/api/spaces/{spaceId}/materials/uploads/complete",
    { params: { path: { spaceId } }, body: input },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to complete upload", response.status, error);
  }
  return data.data;
}
