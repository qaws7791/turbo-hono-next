import { toMaterialFromApi } from "./materials.mapper";

import type { Material } from "../model/materials.types";
import type {
  JobStatusOk,
  MaterialUploadCompleteAccepted,
  MaterialUploadCompleteBody,
  MaterialUploadCompleteCreated,
  MaterialUploadInitBody,
  MaterialUploadInitOk,
  MaterialsListOk,
  MaterialsListQuery,
} from "./materials.dto";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export type MaterialsList = {
  data: Array<Material>;
  meta: MaterialsListOk["meta"];
};

export async function listMaterials(
  query?: MaterialsListQuery,
): Promise<MaterialsList> {
  const { data, error, response } = await apiClient.GET("/api/materials", {
    params: { query },
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to list materials", response.status, error);
  }

  return {
    data: data.data.map((item) => toMaterialFromApi(item)),
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
  input: MaterialUploadInitBody,
): Promise<MaterialUploadInitOk["data"]> {
  const { data, error, response } = await apiClient.POST(
    "/api/materials/uploads/init",
    { body: input },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to init upload", response.status, error);
  }
  return data.data;
}

export async function completeMaterialUpload(
  input: MaterialUploadCompleteBody,
): Promise<
  MaterialUploadCompleteCreated["data"] | MaterialUploadCompleteAccepted["data"]
> {
  const { data, error, response } = await apiClient.POST(
    "/api/materials/uploads/complete",
    { body: input },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to complete upload", response.status, error);
  }
  return data.data;
}

export async function getJobStatus(
  jobId: string,
): Promise<JobStatusOk["data"]> {
  const { data, error, response } = await apiClient.GET("/api/jobs/{jobId}", {
    params: { path: { jobId } },
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to fetch job status", response.status, error);
  }
  return data.data;
}
