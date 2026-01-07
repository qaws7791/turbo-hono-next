import { useNavigate } from "react-router";

import { apiClient } from "~/foundation/api/client";
import { env } from "~/foundation/lib/env";

export function useGoogleLogin() {
  const navigate = useNavigate();

  const continueWithGoogle = async (redirectTo?: string) => {
    // MSW 환경일 때
    if (env.VITE_MSW) {
      try {
        // MSW 핸들러가 /api/auth/google 을 가로채서
        // signInWithGoogle() 을 실행하고 성공을 반환하도록 할 것임
        const { response } = await apiClient.GET("/api/auth/google");
        console.log("MSW Google login response:", response);

        if (response.ok) {
          // 모의 로그인 성공 시 홈으로 이동 (또는 지정된 경로)
          navigate(redirectTo || "/home");
          return;
        }

        console.error("MSW Google login failed: response not ok", response);
        // MSW 환경인데 실패한 경우, 백엔드로 리다이렉트하지 않고 에러 처리
        return;
      } catch (error) {
        console.error("MSW Google login error:", error);
        return;
      }
    }

    // 실제 프로덕션 환경에서만 백엔드 엔드포인트로 이동
    const baseUrl = env.VITE_API_BASE_URL;
    const url = new URL(
      "/api/auth/google",
      baseUrl.startsWith("http") ? baseUrl : window.location.origin,
    );

    if (redirectTo) {
      url.searchParams.set("redirectTo", redirectTo);
    }

    window.location.href = url.toString();
  };

  return { continueWithGoogle };
}
