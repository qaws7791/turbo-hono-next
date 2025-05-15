import { env } from "@/config/env";
import { container } from "@/containers";
import { AuthService } from "@/services/auth.service";
import { Context } from "@/types/hono.types";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

const authService = container.get<AuthService>("authService");

const sessionMiddleware = createMiddleware<Context>(async (c, next) => {
  const sessionToken = getCookie(c, env.SESSION_COOKIE_NAME || "session");
  if (!sessionToken) {
    c.set("user", null);
    return await next();
  }

  try {
    const user = await authService.validateSession(sessionToken);

    if (!user) {
      deleteCookie(c, env.SESSION_COOKIE_NAME || "session");
      return await next();
    }

    // 세션 갱신 후 쿠키 만료일도 업데이트
    const cookieOptions = authService.getSessionCookieOptions();
    setCookie(
      c,
      env.SESSION_COOKIE_NAME || "session",
      sessionToken,
      cookieOptions,
    );

    c.set("user", user);

    await next();
  } catch {
    return await next();
  }
});

export default sessionMiddleware;
