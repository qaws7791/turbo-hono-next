import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import {
  completeMaterialUpload,
  initMaterialUpload,
} from "../api/materials.api";
import { materialsQueries } from "../materials.queries";

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
 * 파일 업로드 후, 자료 분석은 비동기 작업 큐로 처리합니다.
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
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const abortController = new AbortController();
      abortRef.current = abortController;

      // 진행 상황 초기화
      setProgress({
        step: "PREPARING",
        progress: 5,
        message: "업로드를 준비하고 있습니다...",
      });

      // 1. 업로드 세션 생성
      const init = await initMaterialUpload(
        {
          originalFilename: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        },
        {
          signal: abortController.signal,
        },
      );

      setProgress({
        step: "UPLOADING",
        progress: 30,
        message: "파일을 업로드하고 있습니다...",
      });

      // 2. R2에 파일 업로드
      const uploadResponse = await fetch(init.uploadUrl, {
        method: init.method,
        headers: init.headers,
        body: file,
        signal: abortController.signal,
      });
      if (!uploadResponse.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      const etag = normalizeEtag(uploadResponse.headers.get("etag"));

      setProgress({
        step: "FINALIZING",
        progress: 80,
        message: "업로드 완료 처리를 진행하고 있습니다...",
      });

      // 3. 업로드 완료 처리(비동기 작업 큐 등록 포함)
      await completeMaterialUpload(
        { uploadId: init.uploadId, title, etag },
        { signal: abortController.signal },
      );

      setProgress({
        step: "QUEUED",
        progress: 100,
        message: "분석을 시작했습니다. 목록에서 진행 상황을 확인하세요.",
      });

      // UX: 다이얼로그는 onSuccess에서 닫히므로 여기서는 즉시 해제
      setProgress(null);
      abortRef.current = null;
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
      abortRef.current = null;
    },
  });

  // 취소 함수
  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setProgress(null);
  };

  return {
    ...mutation,
    progress,
    cancel,
  };
}
