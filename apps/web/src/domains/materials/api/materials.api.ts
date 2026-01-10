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

// ========== SSE 스트리밍 관련 타입 및 함수 ==========

/** 진행 상황 이벤트 */
export type UploadProgressEvent = {
  step: string;
  progress: number;
  message: string;
};

/** 완료 이벤트 */
export type UploadCompleteEvent = {
  data: {
    id: string;
    title?: string;
    processingStatus: string;
    summary: string | null;
  };
};

/** 에러 이벤트 */
export type UploadErrorEvent = {
  code: string;
  message: string;
};

/** SSE 콜백 */
export type UploadSSECallbacks = {
  onProgress: (event: UploadProgressEvent) => void;
  onComplete: (event: UploadCompleteEvent) => void;
  onError: (event: UploadErrorEvent) => void;
};

/**
 * SSE를 통해 업로드 완료 처리를 수행합니다.
 * 진행 상황을 실시간으로 수신할 수 있습니다.
 *
 * @returns 취소 함수 (연결을 중단할 때 호출)
 */
export function completeMaterialUploadSSE(
  input: MaterialUploadCompleteBody,
  callbacks: UploadSSECallbacks,
): () => void {
  const abortController = new AbortController();

  (async () => {
    try {
      const { response } = await apiClient.POST(
        "/api/materials/uploads/complete/stream",
        {
          body: input,
          signal: abortController.signal,
          parseAs: "stream",
        },
      );

      if (!response.ok || !response.body) {
        throw new Error("SSE connection failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim()) continue;

          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            try {
              const data = JSON.parse(dataMatch[1]);

              if (eventType === "progress") {
                callbacks.onProgress(data as UploadProgressEvent);
              } else if (eventType === "complete") {
                callbacks.onComplete(data as UploadCompleteEvent);
              } else if (eventType === "error") {
                callbacks.onError(data as UploadErrorEvent);
              }
            } catch {
              // JSON 파싱 오류 무시
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        callbacks.onError({
          code: "CONNECTION_ERROR",
          message:
            error instanceof Error ? error.message : "연결에 실패했습니다.",
        });
      }
    }
  })();

  return () => abortController.abort();
}
