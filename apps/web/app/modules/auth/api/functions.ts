import type { AuthUser } from "../domain";
import type { MagicLinkApiBody } from "./schema";

import { apiClient, getApiBaseUrl, unwrap } from "~/modules/api";

function resolveApiOrigin(): string | undefined {
  const baseUrl = getApiBaseUrl();
  if (baseUrl.length > 0) return baseUrl;
  if (typeof window !== "undefined") return window.location.origin;
  return undefined;
}

export function buildGoogleAuthUrl(input?: { redirectPath?: string }): string {
  const origin = resolveApiOrigin();
  const pathname = "/api/auth/google";
  const redirectPath = input?.redirectPath;

  if (!origin) {
    if (!redirectPath) return pathname;
    return `${pathname}?redirectPath=${encodeURIComponent(redirectPath)}`;
  }

  const url = new URL(pathname, origin);
  if (redirectPath) url.searchParams.set("redirectPath", redirectPath);
  return url.toString();
}

export async function fetchAuthMe(): Promise<AuthUser> {
  const result = await apiClient.GET("/api/auth/me");
  return unwrap(result).data;
}

export async function postLogout(): Promise<void> {
  const result = await apiClient.POST("/api/auth/logout");
  unwrap(result);
}

export async function postMagicLink(input: MagicLinkApiBody): Promise<void> {
  const result = await apiClient.POST("/api/auth/magic-link", { body: input });
  unwrap(result);
}
