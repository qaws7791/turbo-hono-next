import { getCookie } from "hono/cookie";

import { authConfig } from "../config/auth";
import { AuthErrors } from "../modules/auth/errors";
import { sessionService } from "../modules/auth/services/session.service";

import type { SessionData } from "../modules/auth/services/session.service";
import type { Context, Next } from "hono";

export interface AuthContext {
  user: SessionData["user"];
  session: {
    id: string;
    expiresAt: Date;
  };
}

export async function authMiddleware(c: Context, next: Next) {
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

  // Set auth context
  c.set("auth", {
    user: sessionData.user,
    session: {
      id: sessionData.id,
      expiresAt: sessionData.expiresAt,
    },
  });

  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  // Get session token from cookie
  const cookieHeader = c.req.header("cookie");
  let sessionToken: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith(`${authConfig.session.cookieName}=`),
    );

    if (sessionCookie) {
      sessionToken = sessionCookie.split("=")[1];
    }
  }

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
}
