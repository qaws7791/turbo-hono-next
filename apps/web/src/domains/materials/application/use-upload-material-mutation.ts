import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import {
  completeMaterialUploadSSE,
  initMaterialUpload,
} from "../api/materials.api";
import { materialsQueries } from "../materials.queries";

import type { UploadProgressEvent } from "../api/materials.api";

function normalizeEtag(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^"|"$/g, "");
}

/** 업로드 진행 상황 타입 */
export type UploadProgress = {
  step: string;
  progress: number;
  message: string;
};

/**
 * Material 업로드 Mutation Hook
 *
 * SSE 스트리밍을 통해 실시간 진행 상황을 제공합니다.
 *
 * @example
 * ```tsx
 * const { mutate, progress, isPending } = useUploadMaterialMutation();
 *
 * // 업로드 시작
 * mutate({ file, title });
 *
 * // 진행 상황 표시
 * {progress && <ProgressBar value={progress.progress} message={progress.message} />}
 * ```
 */
export function useUploadMaterialMutation() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      // 진행 상황 초기화
      setProgress({
        step: "UPLOADING",
        progress: 0,
        message: "📤 파일 업로드 중...",
      });

      // 1. 업로드 세션 생성
      const init = await initMaterialUpload({
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      // 2. R2에 파일 업로드
      const uploadResponse = await fetch(init.uploadUrl, {
        method: init.method,
        headers: init.headers,
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      const etag = normalizeEtag(uploadResponse.headers.get("etag"));

      // 3. SSE를 통한 완료 처리
      return new Promise<void>((resolve, reject) => {
        cancelRef.current = completeMaterialUploadSSE(
          { uploadId: init.uploadId, title, etag },
          {
            onProgress: (event: UploadProgressEvent) => {
              setProgress({
                step: event.step,
                progress: event.progress,
                message: event.message,
              });
            },
            onComplete: () => {
              setProgress(null);
              cancelRef.current = null;
              resolve();
            },
            onError: (event) => {
              setProgress(null);
              cancelRef.current = null;
              reject(new Error(event.message));
            },
          },
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialsQueries.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: materialsQueries.counts(),
      });
    },
    onError: () => {
      setProgress(null);
    },
  });

  // 취소 함수
  const cancel = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
      setProgress(null);
    }
  };

  return {
    ...mutation,
    progress,
    cancel,
  };
}
