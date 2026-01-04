import { toDocumentFromApi } from "../model/mappers";

import type { Document } from "../model/types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";
import { listMaterials } from "~/foundation/api/materials";
import { nowIso } from "~/foundation/lib/time";

export async function listDocumentsForUi(
  spaceId: string,
): Promise<Array<Document>> {
  const result = await listMaterials(spaceId, { page: 1, limit: 100 });
  return result.data.map((m) => toDocumentFromApi(spaceId, m));
}

export async function deleteDocumentForUi(materialId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    "/api/materials/{materialId}",
    {
      params: { path: { materialId } },
    },
  );
  if (!response.ok) {
    throw new ApiError("Failed to delete material", response.status, error);
  }
}

export async function uploadFileDocumentForUi(input: {
  spaceId: string;
  file: File;
  title: string;
}): Promise<void> {
  const {
    data: initData,
    error: initError,
    response: initResponse,
  } = await apiClient.POST("/api/spaces/{spaceId}/materials/uploads/init", {
    params: { path: { spaceId: input.spaceId } },
    body: {
      originalFilename: input.file.name,
      mimeType: input.file.type || "application/octet-stream",
      fileSize: input.file.size,
    },
  });
  if (!initResponse.ok || !initData) {
    throw new ApiError("Failed to init upload", initResponse.status, initError);
  }

  const { error: completeError, response: completeResponse } =
    await apiClient.POST("/api/spaces/{spaceId}/materials/uploads/complete", {
      params: { path: { spaceId: input.spaceId } },
      body: {
        uploadId: initData.data.uploadId,
        title: input.title,
        etag: nowIso(),
      },
    });
  if (!completeResponse.ok) {
    throw new ApiError(
      "Failed to complete upload",
      completeResponse.status,
      completeError,
    );
  }
}
