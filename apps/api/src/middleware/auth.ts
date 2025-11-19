import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { authConfig } from "../config/auth";
import { AuthErrors } from "../modules/auth/errors";
import { sessionService } from "../modules/auth/services/session.service";

import type { AuthVariables, OptionalAuthVariables } from "../types/variables";
import type { SessionData } from "../modules/auth/services/session.service";

export interface AuthContext {
  user: SessionData["user"];
  session: {
    id: string;
    expiresAt: Date;
  };
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    // Get session token from cookie
    const sessionToken = getCookie(c, authConfig.session.cookieName);

    if (!sessionToken) {
      throw AuthErrors.unauthorized();
    }

    // Verify session
    const sessionData = await sessionService.getSessionByToken(sessionToken);
    if (!sessionData) {
      throw AuthErrors.sessionExpired();
    }

    // Set auth context with type safety
    c.set("auth", {
      user: sessionData.user,
      session: {
        id: sessionData.id,
        expiresAt: sessionData.expiresAt,
      },
    });

    await next();
  },
);

export const optionalAuthMiddleware = createMiddleware<{
  Variables: OptionalAuthVariables;
}>(async (c, next) => {
  // Get session token from cookie
  const sessionToken = getCookie(c, authConfig.session.cookieName);

  // If token exists, try to verify session
  if (sessionToken) {
    const sessionData = await sessionService.getSessionByToken(sessionToken);
    if (sessionData) {
      c.set("auth", {
        user: sessionData.user,
        session: {
          id: sessionData.id,
          expiresAt: sessionData.expiresAt,
        },
      });
    }
  }

  await next();
});
