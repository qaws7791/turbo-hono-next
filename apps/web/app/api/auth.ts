import { apiClient } from "./client";
import { ApiError } from "./error";

import type { paths } from "~/types/api";

type AuthUser =
  paths["/api/auth/me"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export async function getAuthMe(): Promise<AuthUser | null> {
  const { data, error, response } = await apiClient.GET("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok || !data) {
    throw new ApiError("Failed to fetch auth me", response.status, error);
  }
  return data.data;
}

export async function requestMagicLink(input: {
  email: string;
  redirectPath: string;
}): Promise<void> {
  const { error, response } = await apiClient.POST("/api/auth/magic-link", {
    body: input,
  });
  if (!response.ok) {
    throw new ApiError("Failed to request magic link", response.status, error);
  }
}

export async function logout(): Promise<void> {
  const { error, response } = await apiClient.POST("/api/auth/logout");
  if (!response.ok) {
    throw new ApiError("Failed to logout", response.status, error);
  }
}
