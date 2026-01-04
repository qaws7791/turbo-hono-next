import { toUserFromApi } from "../model/mappers";

import type { AuthStatus } from "../model/types";

import { getAuthMe } from "~/foundation/api/auth";

export async function getAuthSession(): Promise<AuthStatus> {
  const me = await getAuthMe();
  if (!me) {
    return { isAuthenticated: false, user: null };
  }
  return { isAuthenticated: true, user: toUserFromApi(me) };
}
