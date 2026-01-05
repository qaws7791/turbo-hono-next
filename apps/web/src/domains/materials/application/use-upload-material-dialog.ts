import * as React from "react";

export type UploadMaterialDialog = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export function useUploadMaterialDialog(): UploadMaterialDialog {
  const [isOpen, setIsOpen] = React.useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
