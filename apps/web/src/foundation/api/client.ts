import createClient from "openapi-fetch";

import type { paths } from "~/foundation/types/api";

import { env } from "~/foundation/lib/env";

declare global {
  var __mswStartPromise: Promise<unknown> | undefined;
}

const baseUrl = (() => {
  return env.VITE_API_BASE_URL;
})();

const apiFetch: typeof fetch = async (input, init) => {
  if (env.DEV || env.VITE_MSW) {
    await globalThis.__mswStartPromise;
  }
  return fetch(input, init);
};

export const apiClient = createClient<paths>({ baseUrl, fetch: apiFetch });
