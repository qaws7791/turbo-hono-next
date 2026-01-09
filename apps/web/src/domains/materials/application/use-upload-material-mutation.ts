import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  completeMaterialUpload,
  getJobStatus,
  initMaterialUpload,
} from "../api/materials.api";
import { materialsQueries } from "../materials.queries";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEtag(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^"|"$/g, "");
}

export function useUploadMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const init = await initMaterialUpload({
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      const uploadResponse = await fetch(init.uploadUrl, {
        method: init.method,
        headers: init.headers,
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const etag = normalizeEtag(uploadResponse.headers.get("etag"));

      const completed = await completeMaterialUpload({
        uploadId: init.uploadId,
        title,
        etag,
      });

      if ("jobId" in completed) {
        const startedAt = Date.now();
        const timeoutMs = 30_000;

        while (Date.now() - startedAt < timeoutMs) {
          const job = await getJobStatus(completed.jobId);
          if (job.status === "SUCCEEDED") return;
          if (job.status === "FAILED") {
            throw new Error(job.error?.message ?? "Job failed");
          }
          await sleep(750);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialsQueries.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: materialsQueries.counts(),
      });
    },
  });
}
