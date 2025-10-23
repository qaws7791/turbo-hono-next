import { getCookie } from "hono/cookie";

import { authConfig } from "../config/auth";
import { AuthError } from "../modules/auth/errors";
import { sessionUtils } from "../utils/session";

import type { SessionData} from "../utils/session";
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
    throw new AuthError(
      401,
      "auth:authentication_required",
      "Authentication required",
    );
  }

  // Verify session
  const sessionData = await sessionUtils.getSessionByToken(sessionToken);
  if (!sessionData) {
    throw new AuthError(
      401,
      "auth:invalid_or_expired_session",
      "Invalid or expired session",
    );
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
    const sessionData = await sessionUtils.getSessionByToken(sessionToken);
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
