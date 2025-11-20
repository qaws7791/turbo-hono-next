import { queryOptions } from "@tanstack/react-query";

import { fetchCurrentUser } from "./auth-service";

/**
 * Auth Query Keys Factory
 * 인증 관련 쿼리 키를 중앙 관리합니다.
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * 현재 로그인한 사용자 정보를 가져오는 Query Options
 *
 * staleTime: Infinity - 세션 정보는 rarely change하므로 자동 refetch 비활성화
 * retry: false - 인증 실패 시 재시도하지 않음
 */
export const authMeQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  });
