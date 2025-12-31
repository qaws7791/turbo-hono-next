import createClient from "openapi-fetch";

import { getApiBaseUrl } from "./env";

import type { paths } from "~/types/api";

export const apiClient = createClient<paths>({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
});
