import * as React from "react";

import type { Document } from "~/app/mocks/schemas";

export type SpaceDocumentsModel = {
  uploadOpen: boolean;
  openUpload: () => void;
  closeUpload: () => void;
  completedCount: number;
};

export function useSpaceDocumentsModel(
  documents: Array<Document>,
): SpaceDocumentsModel {
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const completedCount = React.useMemo(
    () => documents.filter((d) => d.status === "completed").length,
    [documents],
  );

  return {
    uploadOpen,
    openUpload: () => setUploadOpen(true),
    closeUpload: () => setUploadOpen(false),
    completedCount,
  };
}
