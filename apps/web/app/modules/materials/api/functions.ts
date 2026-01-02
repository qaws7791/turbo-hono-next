import type {
  MaterialDetail,
  MaterialProcessingStatus,
  SpaceMaterialsResponse,
  UploadCompleteAcceptedResponse,
  UploadCompleteBody,
  UploadCompleteCreatedResponse,
  UploadInitBody,
  UploadInitResponse,
} from "../domain";

import { apiClient, unwrap } from "~/modules/api";

export async function fetchSpaceMaterials(input: {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: MaterialProcessingStatus;
  search?: string;
  sort?: string;
}): Promise<SpaceMaterialsResponse> {
  const result = await apiClient.GET("/api/spaces/{spaceId}/materials", {
    params: {
      path: { spaceId: input.spaceId },
      query: {
        page: input.page,
        limit: input.limit,
        status: input.status,
        search: input.search,
        sort: input.sort,
      },
    },
  });
  return unwrap(result);
}

export async function fetchMaterial(
  materialId: string,
): Promise<MaterialDetail> {
  const result = await apiClient.GET("/api/materials/{materialId}", {
    params: { path: { materialId } },
  });
  return unwrap(result).data;
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const result = await apiClient.DELETE("/api/materials/{materialId}", {
    params: { path: { materialId } },
  });
  unwrap(result);
}

export async function postUploadInit(input: {
  spaceId: string;
  body: UploadInitBody;
}): Promise<UploadInitResponse> {
  const result = await apiClient.POST(
    "/api/spaces/{spaceId}/materials/uploads/init",
    {
      params: { path: { spaceId: input.spaceId } },
      body: input.body,
    },
  );
  return unwrap(result);
}

export async function putPresignedUpload(input: {
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  file: File;
}): Promise<{ etag: string | null }> {
  const response = await fetch(input.uploadUrl, {
    method: input.method,
    headers: input.headers,
    body: input.file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return { etag: response.headers.get("ETag") };
}

export async function postUploadComplete(input: {
  spaceId: string;
  body: UploadCompleteBody;
}): Promise<UploadCompleteCreatedResponse | UploadCompleteAcceptedResponse> {
  const result = await apiClient.POST(
    "/api/spaces/{spaceId}/materials/uploads/complete",
    {
      params: { path: { spaceId: input.spaceId } },
      body: input.body,
    },
  );
  return unwrap(result);
}
