import { z } from "zod";

import {
  readJsonFromStorage,
  removeFromStorage,
  writeJsonToStorage,
} from "./storage";

const AUTH_KEY = "tlm_auth_v1";

const AuthSessionSchema = z.object({
  userId: z.string().uuid(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

export function readAuthSession(): AuthSession | null {
  return readJsonFromStorage(AUTH_KEY, AuthSessionSchema);
}

export function writeAuthSession(session: AuthSession): void {
  writeJsonToStorage(AUTH_KEY, AuthSessionSchema, session);
}

export function clearAuthSession(): void {
  removeFromStorage(AUTH_KEY);
}

export function getRedirectTarget(requestUrl: string): string {
  try {
    const url = new URL(requestUrl);
    return `${url.pathname}${url.search}`;
  } catch {
    return "/home";
  }
}

export function safeRedirectTo(
  value: string | null,
  input?: { fallback?: string },
): string {
  const fallback = input?.fallback ?? "/home";
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}
