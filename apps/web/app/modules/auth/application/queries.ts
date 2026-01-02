import { useQuery } from "@tanstack/react-query";

import { fetchAuthMe } from "../api";

import { authKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { AuthUser } from "../domain";

export function useAuthMeQuery() {
  return useQuery<AuthUser, ApiError>({
    queryKey: authKeys.me,
    queryFn: fetchAuthMe,
  });
}
