import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import status from "http-status";
import { authConfig } from "../../../config/auth";
import { db } from "../../../database/client";
import { account, user } from "../../../database/schema";
import { passwordUtils } from "../../../utils/password";
import { sessionUtils } from "../../../utils/session";
import { AuthError } from "../errors";
import { AuthModel } from "../schema";

const loginWithEmail = new OpenAPIHono().openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/auth/login",
    summary: "Login with email and password",
    request: {
      body: {
        content: {
          "application/json": {
            schema: AuthModel.EmailLoginRequestSchema,
          },
        },
        description: "Login with email and password",
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: AuthModel.SessionResponseSchema,
          },
        },
        description: "Login successful",
        headers: {
          "Set-Cookie": {
            description: "Session cookie",
            schema: {
              type: "string",
              example:
                "session=sessionTokenValue; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800",
            },
          },
        },
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Invalid credentials",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Invalid input",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: AuthModel.ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
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

      if (result.length === 0 || !result[0].account.password) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "Invalid credentials",
        );
      }

      const { user: foundUser, account: foundAccount } = result[0];

      if (!foundAccount.password) {
        throw new AuthError(
          401,
          "auth:invalid_credentials",
          "Invalid credentials",
        );
      }

      // Verify password
      const isValidPassword = await passwordUtils.verify(
        password,
        foundAccount.password,
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
