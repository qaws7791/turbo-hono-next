import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createConceptReview } from "../api";

import { conceptKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { CreateReviewBody, CreateReviewResponse } from "../domain";

export function useCreateConceptReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateReviewResponse,
    ApiError,
    { conceptId: string; body: CreateReviewBody }
  >({
    mutationFn: createConceptReview,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: conceptKeys.detail(variables.conceptId),
      });
      await queryClient.invalidateQueries({ queryKey: conceptKeys.all });
    },
  });
}
