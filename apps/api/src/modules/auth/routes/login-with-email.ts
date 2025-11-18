import { OpenAPIHono } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";
import status from "http-status";
import { loginWithEmailRoute } from "@repo/api-spec/modules/auth/routes";

import { authConfig } from "../../../config/auth";
import { log } from "../../../lib/logger";
import { authService } from "../services/auth.service";
import { AuthErrors } from "../errors";

const loginWithEmail = new OpenAPIHono().openapi(
  loginWithEmailRoute,
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      // Get user agent and IP address for session tracking
      const userAgent = c.req.header("user-agent");
      const ipAddress =
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");

      // Call auth service to authenticate and create session
      const result = await authService.loginWithEmail({
        email,
        password,
        userAgent,
        ipAddress,
      });

      // Set session cookie
      setCookie(c, authConfig.session.cookieName, result.session.id, {
        maxAge: authConfig.session.cookieOptions.maxAge / 1000, // setCookie expects seconds
        httpOnly: authConfig.session.cookieOptions.httpOnly,
        secure: authConfig.session.cookieOptions.secure,
        sameSite: authConfig.session.cookieOptions.sameSite,
        path: "/",
      });

      return c.json(result, status.OK);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }
      log.error("Login error", error);
      throw AuthErrors.forbidden({ message: "Internal server error" });
    }
  },
);

export default loginWithEmail;
