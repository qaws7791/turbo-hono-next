import * as React from "react";
import { useRevalidator } from "react-router";

import {
  completeMaterialUpload,
  deleteMaterial as deleteMaterialApi,
  initMaterialUpload,
} from "../api/materials.api";

import { nowIso } from "~/foundation/lib/time";

export function useMaterialMutations(spaceId: string): {
  isSubmitting: boolean;
  deleteMaterial: (materialId: string) => void;
  uploadFileMaterial: (file: File, title: string) => void;
} {
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const deleteMaterial = React.useCallback(
    async (materialId: string) => {
      setIsSubmitting(true);
      try {
        await deleteMaterialApi(materialId);
        revalidator.revalidate();
      } finally {
        setIsSubmitting(false);
      }
    },
    [revalidator],
  );

  const uploadFileMaterial = React.useCallback(
    async (file: File, title: string) => {
      setIsSubmitting(true);
      try {
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

        revalidator.revalidate();
      } finally {
        setIsSubmitting(false);
      }
    },
    [revalidator, spaceId],
  );

  return { isSubmitting, deleteMaterial, uploadFileMaterial };
}
