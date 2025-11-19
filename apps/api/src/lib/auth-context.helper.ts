import type { AuthVariables } from "../types/variables";
import type { Context } from "hono";

/**
 * Extract authentication context from request.
 * Provides convenient access to user ID and session information.
 *
 * @example
 * const { userId } = extractAuthContext(c);
 * const { userId, sessionId } = extractAuthContext(c);
 */
export function extractAuthContext(c: Context<{ Variables: AuthVariables }>) {
  const auth = c.get("auth");
  return {
    userId: auth.user.id,
    userEmail: auth.user.email,
    sessionId: auth.session.id,
    sessionExpiresAt: auth.session.expiresAt,
  };
}
