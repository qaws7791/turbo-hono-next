import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteCookie, getCookie } from "hono/cookie";
import status from "http-status";
import { authConfig } from "../../../config/auth";
import { sessionUtils } from "../../../utils/session";
import { AuthError } from "../errors";
import { logoutRoute } from "@repo/api-spec/modules/auth/routes";

const logout = new OpenAPIHono().openapi(
  logoutRoute,
  async (c) => {
    try {
      // Get session token from cookie
      const sessionToken = getCookie(c, authConfig.session.cookieName);

      // Delete session if token exists
      if (sessionToken) {
        await sessionUtils.deleteSession(sessionToken);
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
      console.error("Logout error:", error);
      throw new AuthError(500, "auth:internal_error", "Logout failed");
    }
  },
);

export default logout;
