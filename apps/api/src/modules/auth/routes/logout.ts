import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteCookie, getCookie } from "hono/cookie";
import status from "http-status";
import { logoutRoute } from "@repo/api-spec/modules/auth/routes";

import { authConfig } from "../../../config/auth";
import { log } from "../../../lib/logger";
import { sessionService } from "../services/session.service";
import { AuthErrors } from "../errors";

const logout = new OpenAPIHono().openapi(logoutRoute, async (c) => {
  try {
    // Get session token from cookie
    const sessionToken = getCookie(c, authConfig.session.cookieName);

    // Delete session if token exists
    if (sessionToken) {
      await sessionService.deleteSession(sessionToken);
    }

    // Clear session cookie
    deleteCookie(c, authConfig.session.cookieName, {
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "Logout successful",
      },
      status.OK,
    );
  } catch (error) {
    log.error("Logout error", error);
    throw AuthErrors.forbidden({ message: "Logout failed" });
  }
});

export default logout;
