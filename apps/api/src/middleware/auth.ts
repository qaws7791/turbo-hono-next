import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { CONFIG } from "../lib/config";
import { throwAppError } from "../lib/result";
import { getSessionByToken } from "../modules/auth";

import { ApiError } from "./error-handler";

import type { AuthContext } from "../modules/auth";

export type AuthVariables = {
  auth: AuthContext;
};

export type OptionalAuthVariables = {
  auth?: AuthContext;
};

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const token = getCookie(c, CONFIG.SESSION_COOKIE_NAME);
    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    }

    const sessionResult = await getSessionByToken(token, {
      ipAddress:
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    });

    if (sessionResult.isErr()) {
      throwAppError(sessionResult.error);
    }

    const session = sessionResult.value;

    if (!session) {
      throw new ApiError(401, "SESSION_EXPIRED", "세션이 만료되었습니다.");
    }

    c.set("auth", session);
    await next();
  },
);

export const optionalAuth = createMiddleware<{
  Variables: OptionalAuthVariables;
}>(async (c, next) => {
  const token = getCookie(c, CONFIG.SESSION_COOKIE_NAME);
  if (token) {
    const sessionResult = await getSessionByToken(token, {
      ipAddress:
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    });

    if (sessionResult.isOk() && sessionResult.value) {
      c.set("auth", sessionResult.value);
    }
  }
  await next();
});
