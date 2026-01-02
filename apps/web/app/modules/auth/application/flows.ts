import * as React from "react";
import { useLocation, useNavigate } from "react-router";

import {
  buildGoogleAuthUrl,
  fetchAuthMe,
  postLogout,
  postMagicLink,
} from "../api";

import type { MagicLinkApiBody } from "../api";
import type { AuthUser } from "../domain";

import { isUnauthorizedError } from "~/modules/api";
import { queryClient } from "~/modules/query";

export function useRedirectToLoginOnUnauthorized(input: {
  isError: boolean;
  error: unknown;
}): void {
  const { error, isError } = input;

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isError) return;
    if (!isUnauthorizedError(error)) return;

    const redirectTo = `${location.pathname}${location.search}`;
    navigate(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, {
      replace: true,
    });
  }, [error, isError, location.pathname, location.search, navigate]);
}

export async function fetchAuthMeOrNull(): Promise<AuthUser | null> {
  try {
    return await fetchAuthMe();
  } catch {
    return null;
  }
}

export async function sendMagicLink(input: MagicLinkApiBody): Promise<void> {
  await postMagicLink(input);
}

export function startGoogleAuth(input: { redirectPath: string }): void {
  if (typeof window === "undefined") return;
  window.location.assign(
    buildGoogleAuthUrl({ redirectPath: input.redirectPath }),
  );
}

export async function logoutAndClearCache(): Promise<void> {
  await postLogout();
  queryClient.clear();
}
