import * as React from "react";

import type { Material } from "~/app/mocks/schemas";

export type SpaceMaterialsModel = {
  uploadOpen: boolean;
  openUpload: () => void;
  closeUpload: () => void;
  completedCount: number;
};

export function useSpaceMaterialsModel(
  materials: Array<Material>,
): SpaceMaterialsModel {
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const completedCount = React.useMemo(
    () => materials.filter((d) => d.status === "completed").length,
    [materials],
  );

  return {
    uploadOpen,
    openUpload: () => setUploadOpen(true),
    closeUpload: () => setUploadOpen(false),
    completedCount,
  };
}
