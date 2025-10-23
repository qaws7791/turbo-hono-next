import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import status from "http-status";
import { account, user } from "@repo/database/schema";
import { loginWithEmailRoute } from "@repo/api-spec/modules/auth/routes";

import { authConfig } from "../../../config/auth";
import { db } from "../../../database/client";
import { passwordUtils } from "../../../utils/password";
import { sessionUtils } from "../../../utils/session";
import { AuthError } from "../errors";

const loginWithEmail = new OpenAPIHono().openapi(
  loginWithEmailRoute,
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      // Find user and their email/password account
      const result = await db
        .select({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            image: user.image,
          },
          account: {
            password: account.password,
          },
        })
        .from(user)
        .innerJoin(account, eq(account.userId, user.id))
        .where(and(eq(user.email, email), eq(account.providerId, "email")))
        .limit(1);

      const [loginRow] = result;

      if (!loginRow) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "Invalid credentials",
        );
      }

      const accountPassword = loginRow.account.password;

      if (!accountPassword) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "Invalid credentials",
        );
      }

      const foundUser = loginRow.user;

      // Verify password
      const isValidPassword = await passwordUtils.verify(
        password,
        accountPassword,
      );
      if (!isValidPassword) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "Invalid credentials",
        );
      }

      // Create session
      const userAgent = c.req.header("user-agent");
      const ipAddress =
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");
      const sessionToken = await sessionUtils.createSession(
        foundUser.id,
        userAgent,
        ipAddress,
      );

      // Set session cookie
      setCookie(c, authConfig.session.cookieName, sessionToken, {
        maxAge: authConfig.session.cookieOptions.maxAge / 1000, // setCookie expects seconds
        httpOnly: authConfig.session.cookieOptions.httpOnly,
        secure: authConfig.session.cookieOptions.secure,
        sameSite: authConfig.session.cookieOptions.sameSite,
        path: "/",
      });

      return c.json(
        {
          user: {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            emailVerified: Boolean(foundUser.emailVerified),
            image: foundUser.image,
          },
          session: {
            id: sessionToken,
            expiresAt: new Date(
              Date.now() + authConfig.session.expiresIn * 1000,
            ).toISOString(),
          },
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error("Login error:", error);
      throw new AuthError(500, "auth:internal_error", "Internal server error");
    }
  },
);

export default loginWithEmail;
