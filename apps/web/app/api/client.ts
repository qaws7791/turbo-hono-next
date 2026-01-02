import createClient from "openapi-fetch";

import type { paths } from "~/types/api";

const baseUrl = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
})();

const apiFetch: typeof fetch = async (input, init) => {
  if (import.meta.env.DEV || import.meta.env.VITE_MSW === "true") {
    const { ensureMswReady } = await import("~/mocks/ensure");
    await ensureMswReady();
  }
  return fetch(input, init);
};

export const apiClient = createClient<paths>({ baseUrl, fetch: apiFetch });
