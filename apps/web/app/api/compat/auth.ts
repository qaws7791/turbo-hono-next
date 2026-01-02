import { toMockUser } from "./mappers";

import type { User } from "~/mock/schemas";

import { getAuthMe } from "~/api/auth";

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  const me = await getAuthMe();
  if (!me) {
    return { isAuthenticated: false, user: null };
  }
  return { isAuthenticated: true, user: toMockUser(me) };
}
