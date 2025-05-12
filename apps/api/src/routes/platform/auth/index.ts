import { env } from "@/config/env";
import { container } from "@/containers";
import { AuthService } from "@/services/auth.service";
import { KakaoAuthService } from "@/services/kakao-auth.service";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import status from "http-status";
import { createOpenAPI } from "../../../helpers/openapi";
import * as routes from "./auth.routes";

const platformAuth = createOpenAPI();

const kakaoAuthService = container.get<KakaoAuthService>("kakaoAuthService");
const authService = container.get<AuthService>("authService");

platformAuth.openapi(routes.kakaoLogin, (c) => {
  const redirectUrl = kakaoAuthService.getKakaoLoginUrl();
  return c.redirect(redirectUrl);
});

platformAuth.openapi(routes.socialLogin, async (c) => {
  const { provider, token } = await c.req.valid("json");

  const sessionToken = await authService.handleKakaoCallback(token, "", "");

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

export default platformAuth;
