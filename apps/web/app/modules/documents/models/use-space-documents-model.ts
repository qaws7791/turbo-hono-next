import * as React from "react";

import type { MaterialListItem } from "~/modules/materials";

export type SpaceDocumentsModel = {
  uploadOpen: boolean;
  openUpload: () => void;
  closeUpload: () => void;
  completedCount: number;
};

export function useSpaceDocumentsModel(
  documents: Array<MaterialListItem>,
): SpaceDocumentsModel {
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const completedCount = React.useMemo(
    () => documents.filter((d) => d.processingStatus === "READY").length,
    [documents],
  );

  return {
    uploadOpen,
    openUpload: () => setUploadOpen(true),
    closeUpload: () => setUploadOpen(false),
    completedCount,
  };
}
