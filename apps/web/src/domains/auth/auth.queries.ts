import { queryOptions } from "@tanstack/react-query";

import { getAuthMe } from "./api/auth.api";
import { toUserFromApi } from "./api/auth.mapper";
import { getAuthSession } from "./application/auth-session";

import type { AuthStatus, User } from "./model/types";

export const authQueries = {
  all: () => ["auth"] as const,
  me: () => [...authQueries.all(), "me"] as const,
  session: () => [...authQueries.all(), "session"] as const,

  getMe: () =>
    queryOptions({
      queryKey: authQueries.me(),
      queryFn: async (): Promise<User | null> => {
        const me = await getAuthMe();
        return me ? toUserFromApi(me) : null;
      },
    }),

  getSession: () =>
    queryOptions({
      queryKey: authQueries.session(),
      queryFn: (): Promise<AuthStatus> => getAuthSession(),
    }),
};
