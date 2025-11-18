import { OpenAPIHono } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";
import status from "http-status";
import { signupRoute } from "@repo/api-spec/modules/auth/routes";

import { authConfig } from "../../../config/auth";
import { log } from "../../../lib/logger";
import { authService } from "../services/auth.service";
import { AuthErrors } from "../errors";

const signup = new OpenAPIHono().openapi(signupRoute, async (c) => {
  try {
    const { email, password, name } = c.req.valid("json");

    // Get user agent and IP address for session tracking
    const userAgent = c.req.header("user-agent");
    const ipAddress =
      c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");

    // Call auth service to create user and session
    const result = await authService.signup({
      email,
      password,
      name,
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

    return c.json(result, status.CREATED);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }
    log.error("Signup error", error);
    throw AuthErrors.forbidden({ message: "Internal server error" });
  }
});

export default signup;
