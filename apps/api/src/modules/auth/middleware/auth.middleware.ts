import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { Container } from "inversify";
import { container } from "../../../container/bindings";
import { TYPES } from "../../../container/types";
import { SESSION_CONFIG } from "../../../shared/config/session.config";
import { AuthenticationError, UnauthorizedError } from "../domain/auth.errors";
import type { AuthService } from "../domain/auth.service";
import type { AuthContext } from "../domain/auth.types";

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
    container: Container;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

  if (!sessionToken) {
    throw new AuthenticationError("Session cookie is required");
  }

  const authService = container.get<AuthService>(TYPES.AuthService);

  const { user, session } = await authService.validateSession(sessionToken);

  // Set auth context
  c.set("auth", {
    userId: user.id,
    userRole: user.role,
    sessionId: session.token,
  });

  await next();
});

export function requireRole(role: "user" | "creator") {
  return createMiddleware(async (c, next) => {
    const auth = c.get("auth") as AuthContext;

    if (!auth) {
      throw new AuthenticationError("Authentication required");
    }

    if (role === "creator" && auth.userRole !== "creator") {
      throw new UnauthorizedError("Creator role required");
    }

    await next();
  });
}
