import * as React from "react";

export type DialogState = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export function useDialogState(initialOpen = false): DialogState {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    setOpen: setIsOpen,
    open,
    close,
    toggle,
  };
}
