import { getAuthMe } from "../api/auth.api";
import { toUserFromApi } from "../api/auth.mapper";

import type { AuthStatus } from "../model/types";

export async function getAuthSession(): Promise<AuthStatus> {
  const me = await getAuthMe();
  if (!me) {
    return { isAuthenticated: false, user: null };
  }
  return { isAuthenticated: true, user: toUserFromApi(me) };
}
