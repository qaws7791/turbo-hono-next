import { apiClient } from "../client";
import { ApiError } from "../error";

import type { Document } from "~/app/mocks/schemas";
import type { paths } from "~/foundation/types/api";

import { listMaterials } from "~/foundation/api/materials";
import { nowIso } from "~/foundation/lib/time";

type ApiMaterialListItem =
  paths["/api/spaces/{spaceId}/materials"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

function mapProcessingStatus(
  status: ApiMaterialListItem["processingStatus"],
): Document["status"] {
  if (status === "READY") return "completed";
  if (status === "FAILED") return "error";
  if (status === "PROCESSING") return "analyzing";
  return "pending";
}

function mapMaterialToDocument(
  spaceId: string,
  item: ApiMaterialListItem,
): Document {
  const createdAt = item.createdAt;
  const updatedAt = item.createdAt;

  return {
    id: item.id,
    spaceId,
    title: item.title,
    kind: item.sourceType === "TEXT" ? "text" : "file",
    status: mapProcessingStatus(item.processingStatus),
    summary: item.summary ?? undefined,
    tags: item.tags,
    createdAt,
    updatedAt,
    analysisReadyAt: undefined,
    source:
      item.sourceType === "FILE"
        ? {
            type: "file",
            fileName: item.title,
            fileSizeBytes: item.fileSize ?? undefined,
          }
        : undefined,
  };
}

export async function listDocumentsForUi(
  spaceId: string,
): Promise<Array<Document>> {
  const result = await listMaterials(spaceId, { page: 1, limit: 100 });
  return result.data.map((m) => mapMaterialToDocument(spaceId, m));
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
