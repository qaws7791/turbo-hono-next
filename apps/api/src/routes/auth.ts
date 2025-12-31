import { randomBytes } from "node:crypto";

import {
  authGoogleCallbackRoute,
  authGoogleRoute,
  authLogoutRoute,
  authMeRoute,
  authRequestMagicLinkRoute,
  authVerifyMagicLinkRoute,
} from "@repo/api-spec";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { CONFIG } from "../lib/config";
import { handleResult, jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/error-handler";
import {
  createRateLimitMiddleware,
  getClientIp,
} from "../middleware/rate-limit";
import {
  requestMagicLink,
  revokeSession,
  validateRedirectPath,
  verifyGoogleOAuth,
  verifyMagicLink,
} from "../modules/auth";

import type { OpenAPIHono } from "@hono/zod-openapi";

const requestMagicLinkRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (c) => getClientIp(c) ?? "unknown",
});

const verifyMagicLinkRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (c) => getClientIp(c) ?? "unknown",
});

const OAUTH_STATE_COOKIE_NAME = "oauth_state";
const OAUTH_REDIRECT_COOKIE_NAME = "oauth_redirect_path";
const OAUTH_COOKIE_PATH = "/api/auth/google";
const OAUTH_COOKIE_MAX_AGE_SEC = 10 * 60;

export function registerAuthRoutes(app: OpenAPIHono): void {
  app.openapi(authGoogleRoute, async (c) => {
    const { redirectPath } = c.req.valid("query");

    const nextRedirectPath = redirectPath ?? "/home";
    if (!validateRedirectPath(nextRedirectPath)) {
      throw new ApiError(
        400,
        "INVALID_REDIRECT",
        "redirectPath가 허용되지 않습니다.",
      );
    }

    const clientId = CONFIG.GOOGLE_CLIENT_ID;
    const clientSecret = CONFIG.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new ApiError(
        500,
        "GOOGLE_OAUTH_NOT_CONFIGURED",
        "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET가 필요합니다.",
      );
    }

    const state = randomBytes(16).toString("hex");

    setCookie(c, OAUTH_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: CONFIG.COOKIE_SECURE,
      sameSite: "lax",
      path: OAUTH_COOKIE_PATH,
      domain: CONFIG.COOKIE_DOMAIN,
      maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
    });

    setCookie(c, OAUTH_REDIRECT_COOKIE_NAME, nextRedirectPath, {
      httpOnly: true,
      secure: CONFIG.COOKIE_SECURE,
      sameSite: "lax",
      path: OAUTH_COOKIE_PATH,
      domain: CONFIG.COOKIE_DOMAIN,
      maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
    });

    const redirectUri = new URL(
      "/api/auth/google/callback",
      CONFIG.BASE_URL,
    ).toString();

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("prompt", "select_account");

    return c.redirect(url.toString(), 302);
  });

  app.openapi(authGoogleCallbackRoute, async (c) => {
    const { code, state } = c.req.valid("query");

    const expectedState = getCookie(c, OAUTH_STATE_COOKIE_NAME);
    const redirectPath = getCookie(c, OAUTH_REDIRECT_COOKIE_NAME) ?? "/home";

    deleteCookie(c, OAUTH_STATE_COOKIE_NAME, {
      path: OAUTH_COOKIE_PATH,
      domain: CONFIG.COOKIE_DOMAIN,
    });
    deleteCookie(c, OAUTH_REDIRECT_COOKIE_NAME, {
      path: OAUTH_COOKIE_PATH,
      domain: CONFIG.COOKIE_DOMAIN,
    });

    if (!expectedState || expectedState !== state) {
      throw new ApiError(
        400,
        "OAUTH_STATE_MISMATCH",
        "OAuth state가 올바르지 않습니다.",
      );
    }

    if (!validateRedirectPath(redirectPath)) {
      throw new ApiError(
        400,
        "INVALID_REDIRECT",
        "redirectPath가 허용되지 않습니다.",
      );
    }

    const ipAddress =
      c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");
    const userAgent = c.req.header("user-agent");

    return handleResult(
      verifyGoogleOAuth({ code }, { ipAddress, userAgent }),
      (verified) => {
        setCookie(c, CONFIG.SESSION_COOKIE_NAME, verified.sessionToken, {
          httpOnly: true,
          secure: CONFIG.COOKIE_SECURE,
          sameSite: "lax",
          path: "/",
          domain: CONFIG.COOKIE_DOMAIN,
          maxAge: 60 * 60 * 24 * CONFIG.SESSION_DURATION_DAYS,
        });

        const redirectUrl = new URL(
          redirectPath,
          CONFIG.FRONTEND_URL,
        ).toString();
        return c.redirect(redirectUrl, 302);
      },
    );
  });

  app.openapi(
    {
      ...authRequestMagicLinkRoute,
      middleware: [requestMagicLinkRateLimit] as const,
    },
    async (c) => {
      const body = c.req.valid("json");
      const ipAddress =
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");
      const userAgent = c.req.header("user-agent");

      return jsonResult(
        c,
        requestMagicLink(body, { ipAddress, userAgent }),
        200,
      );
    },
  );

  app.openapi(
    {
      ...authVerifyMagicLinkRoute,
      middleware: [verifyMagicLinkRateLimit] as const,
    },
    async (c) => {
      const { token } = c.req.valid("query");
      const ipAddress =
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");
      const userAgent = c.req.header("user-agent");

      return handleResult(
        verifyMagicLink({ token }, { ipAddress, userAgent }),
        (verified) => {
          setCookie(c, CONFIG.SESSION_COOKIE_NAME, verified.sessionToken, {
            httpOnly: true,
            secure: CONFIG.COOKIE_SECURE,
            sameSite: "lax",
            path: "/",
            domain: CONFIG.COOKIE_DOMAIN,
            maxAge: 60 * 60 * 24 * CONFIG.SESSION_DURATION_DAYS,
          });

          const redirectUrl = new URL(
            verified.redirectPath,
            CONFIG.FRONTEND_URL,
          ).toString();
          return c.redirect(redirectUrl, 302);
        },
      );
    },
  );

  app.openapi(
    { ...authMeRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      return c.json({ data: auth.user }, 200);
    },
  );

  app.openapi(
    { ...authLogoutRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      return handleResult(revokeSession(auth.session.id), () => {
        deleteCookie(c, CONFIG.SESSION_COOKIE_NAME, {
          path: "/",
          domain: CONFIG.COOKIE_DOMAIN,
        });
        return c.json({ message: "로그아웃되었습니다." }, 200);
      });
    },
  );
}
