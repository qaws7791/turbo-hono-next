import { useSuspenseQuery } from "@tanstack/react-query";

import { authQueries } from "../auth.queries";

/**
 * 인증된 사용자의 정보를 가져오는 커스텀 훅입니다.
 * 이 훅은 반드시 인증 가드(AppLayout 등)가 적용된 보호된 경로 하위에서 사용되어야 합니다.
 * 만약 가드 없이 사용될 경우, 개발 환경에서 명시적인 에러를 발생시킵니다.
 */
export function useUser() {
  const { data: session } = useSuspenseQuery(authQueries.getSession());

  if (!session.user) {
    // 런타임에 이 에러가 발생했다는 것은 AppLayout의 가드가 적용되지 않은 곳에서 이 훅을 호출했음을 의미합니다.
    throw new Error(
      "useUser must be used within a protected route where authentication is guaranteed.",
    );
  }

  return session.user;
}
