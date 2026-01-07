import { redirect } from "react-router";

import { authQueries } from "../auth.queries";

import type { AuthStatus, User } from "../model/types";

import { getRedirectTarget } from "~/foundation/lib/auth";
import { queryClient } from "~/foundation/query-client";

/**
 * 인증된 세션을 요구하는 라우트 가드 함수
 *
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트합니다.
 * 인증된 경우 user가 반드시 존재하는 AuthStatus를 반환합니다.
 *
 * @param request - 현재 요청 객체 (리다이렉트 대상 URL 추출용)
 * @returns 인증된 세션 (user가 null이 아님을 보장)
 * @throws redirect - 인증되지 않은 경우 로그인 페이지로 리다이렉트
 */
export async function requireAuth(
  request: Request,
): Promise<AuthStatus & { user: User }> {
  const session = await queryClient.ensureQueryData(authQueries.getSession());

  if (!session?.isAuthenticated || !session.user) {
    const redirectTo = getRedirectTarget(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return session as AuthStatus & { user: User };
}
