import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { deleteCookie, getCookie } from "hono/cookie";
import status from "http-status";
import { authConfig } from "../../../config/auth";
import { sessionUtils } from "../../../utils/session";
import { AuthError } from "../errors";
import { AuthModel } from "../schema";

const logout = new OpenAPIHono().openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/auth/logout",
    summary: "Logout user",
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: AuthModel.SuccessResponseSchema,
          },
        },
        description: "Logout successful",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Logout failed",
      },
    },
  }),
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
