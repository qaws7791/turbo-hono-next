import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  completeMaterialUpload,
  initMaterialUpload,
} from "../api/materials.api";
import { materialsQueries } from "../materials.queries";

import { nowIso } from "~/foundation/lib/time";

export function useUploadMaterialMutation(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const init = await initMaterialUpload(spaceId, {
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      await completeMaterialUpload(spaceId, {
        uploadId: init.uploadId,
        title,
        etag: nowIso(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialsQueries.listForSpace(spaceId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: materialsQueries.countForSpace(spaceId).queryKey,
      });
    },
  });
}
