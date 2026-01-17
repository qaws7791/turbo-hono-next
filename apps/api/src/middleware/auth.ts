import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { throwAppError } from "../lib/result";

import { ApiError } from "./error-handler";

import type { RequestIdVariables } from "./request-id";
import type { AuthContext, AuthService } from "../modules/auth";
import type { Config } from "../lib/config";

export type AuthVariables = {
  auth: AuthContext;
} & RequestIdVariables;

export type OptionalAuthVariables = {
  auth?: AuthContext;
} & RequestIdVariables;

export function createRequireAuthMiddleware(deps: {
  readonly config: Config;
  readonly authService: AuthService;
}) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const token = getCookie(c, deps.config.SESSION_COOKIE_NAME);
    if (!token) throw new ApiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");

    const sessionResult = await deps.authService.getSessionByToken(token, {
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
  });
}

export function createOptionalAuthMiddleware(deps: {
  readonly config: Config;
  readonly authService: AuthService;
}) {
  return createMiddleware<{ Variables: OptionalAuthVariables }>(
    async (c, next) => {
      const token = getCookie(c, deps.config.SESSION_COOKIE_NAME);
      if (token) {
        const sessionResult = await deps.authService.getSessionByToken(token, {
          ipAddress:
            c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
          userAgent: c.req.header("user-agent"),
        });

        if (sessionResult.isOk() && sessionResult.value) {
          c.set("auth", sessionResult.value);
        }
      }
      await next();
    },
  );
}
