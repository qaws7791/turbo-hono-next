import createClient from "openapi-fetch";

import type { paths } from "~/foundation/types/api";

declare global {
  var __mswStartPromise: Promise<unknown> | undefined;
}

const baseUrl = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
})();

const apiFetch: typeof fetch = async (input, init) => {
  if (import.meta.env.DEV || import.meta.env.VITE_MSW === "true") {
    await globalThis.__mswStartPromise;
  }
  return fetch(input, init);
};

export const apiClient = createClient<paths>({ baseUrl, fetch: apiFetch });
