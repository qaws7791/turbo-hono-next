import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postLogout, postMagicLink } from "../api";

import type { ApiError } from "~/modules/api";
import type { MagicLinkApiBody } from "../api";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError>({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useMagicLinkMutation() {
  return useMutation<void, ApiError, MagicLinkApiBody>({
    mutationFn: postMagicLink,
  });
}
