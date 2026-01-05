import * as React from "react";
import { useSearchParams } from "react-router";

export type CreateSpaceDialog = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export function useCreateSpaceDialog(): CreateSpaceDialog {
  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = searchParams.get("create") === "1";

  const open = React.useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.set("create", "1");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const close = React.useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("create");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    isOpen,
    open,
    close,
  };
}
