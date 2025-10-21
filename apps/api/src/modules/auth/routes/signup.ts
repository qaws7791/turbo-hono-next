import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import status from "http-status";
import { nanoid } from "nanoid";
import { account, user } from "@repo/database/schema";
import { signupRoute } from "@repo/api-spec/modules/auth/routes";

import { authConfig } from "../../../config/auth";
import { db } from "../../../database/client";
import { passwordUtils } from "../../../utils/password";
import { sessionUtils } from "../../../utils/session";
import { AuthError } from "../errors";


const signup = new OpenAPIHono().openapi(signupRoute, async (c) => {
  try {
    const { email, password, name } = c.req.valid("json");

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AuthError(409, "auth:user_exists", "User already exists");
    }

    // Hash password
    const hashedPassword = await passwordUtils.hash(password);

    // Create user
    const userId = nanoid();
    const now = new Date();

    await db.insert(user).values({
      id: userId,
      email,
      name: name || email.split("@")[0],
      createdAt: now,
      updatedAt: now,
    });

    // Create account with password
    const accountId = nanoid();
    await db.insert(account).values({
      id: accountId,
      accountId: email,
      providerId: "email",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    const userAgent = c.req.header("user-agent");
    const ipAddress =
      c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");
    const sessionToken = await sessionUtils.createSession(
      userId,
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
          id: userId,
          email,
          name: name || email.split("@")[0],
          emailVerified: false,
          image: null,
        },
        session: {
          id: sessionToken,
          expiresAt: new Date(
            Date.now() + authConfig.session.expiresIn * 1000,
          ).toISOString(),
        },
      },
      status.CREATED,
    );
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error("Signup error:", error);
    throw new AuthError(500, "auth:internal_error", "Internal server error");
  }
});

export default signup;
