import * as React from "react";
import { useRevalidator } from "react-router";

import {
  deleteMaterialForUi,
  uploadFileMaterialForUi,
} from "./materials.actions";

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
        await deleteMaterialForUi(materialId);
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
        await uploadFileMaterialForUi({ spaceId, file, title });
        revalidator.revalidate();
      } finally {
        setIsSubmitting(false);
      }
    },
    [revalidator, spaceId],
  );

  return { isSubmitting, deleteMaterial, uploadFileMaterial };
}
