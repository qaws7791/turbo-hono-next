import { env } from "@/config/env";
import { container } from "@/containers";
import { sendVerificationEmail } from "@/lib/email";
import kakaoOAuth from "@/lib/oauth/kakao";
import { AuthService } from "@/services/auth.service";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import status from "http-status";
import { createOpenAPI } from "../../../helpers/openapi";
import * as routes from "./auth.routes";

const platformAuth = createOpenAPI();

const authService = container.get<AuthService>("authService");

platformAuth.openapi(routes.loginWithKakao, (c) => {
  const redirectUrl = kakaoOAuth.getKakaoLoginUrl();
  return c.redirect(redirectUrl);
});

platformAuth.openapi(routes.socialLogin, async (c) => {
  const { provider, token } = await c.req.valid("json");

  const sessionToken = await authService.loginWithKakao(token, "", "");

  const cookieOptions = authService.getSessionCookieOptions();
  setCookie(
    c,
    env.SESSION_COOKIE_NAME || "session",
    sessionToken,
    cookieOptions,
  );

  return c.newResponse(null, status.CREATED);
});

platformAuth.openapi(routes.logout, async (c) => {
  const sessionToken = getCookie(c, env.SESSION_COOKIE_NAME || "session");
  if (sessionToken) {
    await authService.logout(sessionToken);
  }
  deleteCookie(c, env.SESSION_COOKIE_NAME || "session");
  return c.newResponse(null, status.NO_CONTENT);
});

platformAuth.openapi(routes.session, async (c) => {
  const sessionToken = getCookie(c, env.SESSION_COOKIE_NAME || "session");
  if (!sessionToken) {
    console.log("No session token");
    return c.newResponse(null, status.UNAUTHORIZED);
  }

  const session = await authService.getSession(sessionToken);
  if (!session) {
    console.log("No session");
    return c.newResponse(null, status.UNAUTHORIZED);
  }

  return c.json({
    userId: session.userId,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
  });
});

platformAuth.openapi(routes.emailLogin, async (c) => {
  const { email, password } = await c.req.valid("json");

  const { sessionToken } = await authService.loginWithEmail(email, password);

  const cookieOptions = authService.getSessionCookieOptions();
  setCookie(
    c,
    env.SESSION_COOKIE_NAME || "session",
    sessionToken,
    cookieOptions,
  );

  return c.newResponse(null, status.CREATED);
});

platformAuth.openapi(routes.emailRegister, async (c) => {
  const { email, password, name } = await c.req.valid("json");

  const { userId, verificationToken } = await authService.registerWithEmail(
    email,
    password,
    name,
  );

  const result = await sendVerificationEmail(email, verificationToken);

  if (!result) {
    console.error(`userId:${userId} - 이메일 인증 메일 전송 실패`);
    return c.newResponse(null, status.INTERNAL_SERVER_ERROR);
  }

  return c.newResponse(null, status.CREATED);
});

platformAuth.openapi(routes.emailVerify, async (c) => {
  const { token } = await c.req.valid("json");

  await authService.verifyEmail(token);

  return c.newResponse(null, status.NO_CONTENT);
});

export default platformAuth;
