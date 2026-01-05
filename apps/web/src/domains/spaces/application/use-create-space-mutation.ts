import * as React from "react";
import { useNavigate } from "react-router";

import { createSpaceForUi } from "./spaces";

export function useCreateSpaceMutation(): {
  isSubmitting: boolean;
  createSpace: (input: { name: string; description?: string }) => void;
} {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createSpace = React.useCallback(
    async (input: { name: string; description?: string }) => {
      setIsSubmitting(true);
      try {
        const space = await createSpaceForUi(input);
        navigate(`/spaces/${space.id}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return { isSubmitting, createSpace };
}
