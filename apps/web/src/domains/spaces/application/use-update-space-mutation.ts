import * as React from "react";
import { useRevalidator } from "react-router";

import { updateSpaceForUi } from "./spaces";

export function useUpdateSpaceMutation(): {
  isSubmitting: boolean;
  updateSpace: (
    spaceId: string,
    input: { icon?: string; color?: string },
  ) => void;
} {
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateSpace = React.useCallback(
    async (spaceId: string, input: { icon?: string; color?: string }) => {
      setIsSubmitting(true);
      try {
        await updateSpaceForUi(spaceId, input);
        revalidator.revalidate();
      } finally {
        setIsSubmitting(false);
      }
    },
    [revalidator],
  );

  return { isSubmitting, updateSpace };
}
