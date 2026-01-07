import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { createSpace as createSpaceApi } from "../api/spaces.api";
import { spacesQueries } from "../spaces.queries";

export function useCreateSpaceMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      createSpaceApi(input),
    onSuccess: (space) => {
      queryClient.invalidateQueries({ queryKey: spacesQueries.all() });
      navigate(`/spaces/${space.id}`);
    },
  });
}
