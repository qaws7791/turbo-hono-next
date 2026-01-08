import createClient from "openapi-fetch";

import type { paths } from "~/foundation/types/api";

import { env } from "~/foundation/lib/env";

declare global {
  var __mswStartPromise: Promise<unknown> | undefined;
}

const baseUrl = (() => {
  // MSW가 활성화된 경우, 모든 요청은 현재 도메인 상대 경로로 나가서 MSW 핸들러에 걸려야 합니다.
  if (env.VITE_MSW) {
    return "";
  }
  return env.VITE_API_BASE_URL;
})();

const apiFetch: typeof fetch = async (input, init) => {
  if (env.DEV || env.VITE_MSW) {
    await globalThis.__mswStartPromise;
  }
  return fetch(input, init);
};

// NOTE: 쿠키 기반 인증을 위해 cross-origin 요청에도 쿠키가 포함되어야 합니다.
// openapi-fetch는 createClient 옵션을 RequestInit으로 전달합니다.
export const apiClient = createClient<paths>({
  baseUrl,
  fetch: apiFetch,
  credentials: "include",
});
