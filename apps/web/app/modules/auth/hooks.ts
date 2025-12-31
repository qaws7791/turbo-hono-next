import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAuthMe, postLogout, postMagicLink } from "./api";

import type { AuthUser } from "./types";
import type { ApiError } from "~/modules/api";

const authKeys = {
  me: ["auth", "me"] as const,
};

export function useAuthMeQuery() {
  return useQuery<AuthUser, ApiError>({
    queryKey: authKeys.me,
    queryFn: fetchAuthMe,
  });
}

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
  return useMutation<void, ApiError, { email: string; redirectPath: string }>({
    mutationFn: postMagicLink,
  });
}
