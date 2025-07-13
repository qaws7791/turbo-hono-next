import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteCookie, setCookie } from "hono/cookie";
import { container } from "../../../container/bindings";
import { TYPES } from "../../../container/types";
import { SESSION_CONFIG } from "../../../shared/config/session.config";
import type { AuthRepository } from "../data-access/auth.repository";
import type { AuthService } from "../domain/auth.service";
import type { AuthContext } from "../domain/auth.types";
import {
  emailSigninRoute,
  emailSignupRoute,
  emailVerifyRoute,
  kakaoSigninRoute,
  meRoute,
  signoutAllRoute,
  signoutRoute,
} from "./auth.routes";

const authController = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>();

// Email signup
authController.openapi(emailSignupRoute, async (c) => {
  const { email } = c.req.valid("json");

  const authService = container.get<AuthService>(TYPES.AuthService);
  const result = await authService.emailSignup({ email });

  return c.json(result, 200);
});

// Email signin
authController.openapi(emailSigninRoute, async (c) => {
  const { email } = c.req.valid("json");

  const authService = container.get<AuthService>(TYPES.AuthService);
  const result = await authService.emailSignin({ email });

  return c.json(result, 200);
});

// Kakao signin
authController.openapi(kakaoSigninRoute, async (c) => {
  const { code, redirectUri } = c.req.valid("json");

  const authService = container.get<AuthService>(TYPES.AuthService);
  const result = await authService.kakaoSignin({ code, redirectUri });

  // Set session cookie
  setCookie(
    c,
    SESSION_CONFIG.COOKIE_NAME,
    result.session.token,
    SESSION_CONFIG.COOKIE_OPTIONS,
  );

  return c.json(result, 200);
});

// Email verify
authController.openapi(emailVerifyRoute, async (c) => {
  const { token } = c.req.valid("json");

  const authService = container.get<AuthService>(TYPES.AuthService);
  const result = await authService.verifyEmail({ token });

  // Set session cookie
  setCookie(
    c,
    SESSION_CONFIG.COOKIE_NAME,
    result.session.token,
    SESSION_CONFIG.COOKIE_OPTIONS,
  );

  return c.json(result, 200);
});

// Get current user
authController.openapi(meRoute, async (c) => {
  const auth = c.get("auth");

  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);
  const user = await authRepository.findUserById(auth.userId);

  if (!user) {
    return c.json(
      {
        error: "USER_NOT_FOUND",
        message: "User not found",
        statusCode: 404,
      },
      404,
    );
  }

  return c.json(user, 200);
});

// Sign out
authController.openapi(signoutRoute, async (c) => {
  const auth = c.get("auth");

  const authService = container.get<AuthService>(TYPES.AuthService);
  await authService.signOut(auth.sessionId);

  // Clear session cookie
  deleteCookie(c, SESSION_CONFIG.COOKIE_NAME, SESSION_CONFIG.COOKIE_OPTIONS);

  return c.json({ message: "Successfully signed out" }, 200);
});

// Sign out all
authController.openapi(signoutAllRoute, async (c) => {
  const auth = c.get("auth");

  const authService = container.get<AuthService>(TYPES.AuthService);
  await authService.signOutAll(auth.userId);

  // Clear session cookie
  deleteCookie(c, SESSION_CONFIG.COOKIE_NAME, SESSION_CONFIG.COOKIE_OPTIONS);

  return c.json({ message: "Successfully signed out from all sessions" }, 200);
});

export default authController;
