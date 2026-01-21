import {
  authGoogleCallbackRoute,
  authGoogleRoute,
  authLogoutRoute,
  authMeRoute,
  authRequestMagicLinkRoute,
  authVerifyMagicLinkRoute,
} from "@repo/api-spec";
import * as arctic from "arctic";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { handleResult, jsonResult } from "../lib/result-handler";
import { createRequireAuthMiddleware } from "../middleware/auth";
import { ApiError } from "../middleware/error-handler";
import {
  createOptionalRateLimitMiddleware,
  getClientIp,
} from "../middleware/rate-limit";

import type { OpenAPIHono } from "@hono/zod-openapi";
import type { AppDeps } from "../app-deps";

const OAUTH_STATE_COOKIE_NAME = "oauth_state";
const OAUTH_REDIRECT_COOKIE_NAME = "oauth_redirect_path";
const OAUTH_CODE_VERIFIER_COOKIE_NAME = "oauth_code_verifier";
const OAUTH_COOKIE_PATH = "/api/auth/google";
const OAUTH_COOKIE_MAX_AGE_SEC = 10 * 60;

export function registerAuthRoutes(app: OpenAPIHono, deps: AppDeps): void {
  const requireAuth = createRequireAuthMiddleware({
    config: deps.config,
    authService: deps.services.auth,
  });

  const requestMagicLinkRateLimit = createOptionalRateLimitMiddleware(
    deps.config.RATE_LIMIT_ENABLED,
    {
      windowMs: 60 * 1000,
      max: 5,
      keyGenerator: (c) => getClientIp(c) ?? "unknown",
    },
  );

  const verifyMagicLinkRateLimit = createOptionalRateLimitMiddleware(
    deps.config.RATE_LIMIT_ENABLED,
    {
      windowMs: 60 * 1000,
      max: 10,
      keyGenerator: (c) => getClientIp(c) ?? "unknown",
    },
  );

  app.openapi(authGoogleRoute, async (c) => {
    const { redirectPath } = c.req.valid("query");

    const nextRedirectPath = redirectPath ?? "/home";
    if (!deps.services.auth.validateRedirectPath(nextRedirectPath)) {
      throw new ApiError(
        400,
        "INVALID_REDIRECT",
        "redirectPath가 허용되지 않습니다.",
      );
    }

    const clientId = deps.config.GOOGLE_CLIENT_ID;
    const clientSecret = deps.config.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new ApiError(
        500,
        "GOOGLE_OAUTH_NOT_CONFIGURED",
        "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET가 필요합니다.",
      );
    }

    // Arctic을 사용하여 state와 codeVerifier 생성 (PKCE)
    const state = arctic.generateState();
    const codeVerifier = arctic.generateCodeVerifier();

    const redirectUri = new URL(
      "/api/auth/google/callback",
      deps.config.BASE_URL,
    ).toString();

    const google = new arctic.Google(clientId, clientSecret, redirectUri);
    const scopes = ["openid", "email", "profile"];
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);

    // 쿠키에 state, codeVerifier, redirectPath 저장
    setCookie(c, OAUTH_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: deps.config.COOKIE_SECURE,
      sameSite: "lax",
      path: OAUTH_COOKIE_PATH,
      maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
    });

    setCookie(c, OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
      httpOnly: true,
      secure: deps.config.COOKIE_SECURE,
      sameSite: "lax",
      path: OAUTH_COOKIE_PATH,
      maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
    });

    setCookie(c, OAUTH_REDIRECT_COOKIE_NAME, nextRedirectPath, {
      httpOnly: true,
      secure: deps.config.COOKIE_SECURE,
      sameSite: "lax",
      path: OAUTH_COOKIE_PATH,
      maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
    });

    return c.redirect(url.toString(), 302);
  });

  app.openapi(authGoogleCallbackRoute, async (c) => {
    const { code, state, error, error_description } = c.req.valid("query");

    const expectedState = getCookie(c, OAUTH_STATE_COOKIE_NAME);
    const codeVerifier = getCookie(c, OAUTH_CODE_VERIFIER_COOKIE_NAME);
    const redirectPath = getCookie(c, OAUTH_REDIRECT_COOKIE_NAME) ?? "/home";

    // 쿠키 정리
    deleteCookie(c, OAUTH_STATE_COOKIE_NAME, {
      path: OAUTH_COOKIE_PATH,
    });
    deleteCookie(c, OAUTH_CODE_VERIFIER_COOKIE_NAME, {
      path: OAUTH_COOKIE_PATH,
    });
    deleteCookie(c, OAUTH_REDIRECT_COOKIE_NAME, {
      path: OAUTH_COOKIE_PATH,
    });

    // OAuth 에러 처리 (사용자 취소, 권한 거부 등)
    if (error) {
      deps.logger?.warn(
        { error, error_description },
        "oauth.google.callback_error",
      );

      const errorUrl = new URL("/login", deps.config.FRONTEND_URL);
      errorUrl.searchParams.set("error", error);
      if (error_description) {
        errorUrl.searchParams.set("error_description", error_description);
      }
      return c.redirect(errorUrl.toString(), 302);
    }

    // code가 없으면 에러
    if (!code) {
      const errorUrl = new URL("/login", deps.config.FRONTEND_URL);
      errorUrl.searchParams.set("error", "missing_code");
      return c.redirect(errorUrl.toString(), 302);
    }

    // state 검증
    if (!expectedState || expectedState !== state) {
      deps.logger?.warn(
        { expectedState: !!expectedState, receivedState: !!state },
        "oauth.google.state_mismatch",
      );
      const errorUrl = new URL("/login", deps.config.FRONTEND_URL);
      errorUrl.searchParams.set("error", "state_mismatch");
      return c.redirect(errorUrl.toString(), 302);
    }

    // codeVerifier가 없으면 에러 (PKCE 필수)
    if (!codeVerifier) {
      deps.logger?.warn({}, "oauth.google.missing_code_verifier");
      const errorUrl = new URL("/login", deps.config.FRONTEND_URL);
      errorUrl.searchParams.set("error", "missing_verifier");
      return c.redirect(errorUrl.toString(), 302);
    }

    if (!deps.services.auth.validateRedirectPath(redirectPath)) {
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
      deps.services.auth.verifyGoogleOAuth(
        { code, codeVerifier },
        { ipAddress, userAgent },
      ),
      (verified) => {
        setCookie(
          c,
          deps.config.SESSION_COOKIE_NAME_FULL,
          verified.sessionToken,
          {
            httpOnly: true,
            secure: deps.config.COOKIE_SECURE,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * deps.config.SESSION_DURATION_DAYS,
          },
        );

        const redirectUrl = new URL(
          redirectPath,
          deps.config.FRONTEND_URL,
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
        deps.services.auth.requestMagicLink(body, { ipAddress, userAgent }),
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
        deps.services.auth.verifyMagicLink({ token }, { ipAddress, userAgent }),
        (verified) => {
          setCookie(
            c,
            deps.config.SESSION_COOKIE_NAME_FULL,
            verified.sessionToken,
            {
              httpOnly: true,
              secure: deps.config.COOKIE_SECURE,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * deps.config.SESSION_DURATION_DAYS,
            },
          );

          const redirectUrl = new URL(
            verified.redirectPath,
            deps.config.FRONTEND_URL,
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
      return handleResult(
        deps.services.auth.revokeSession(auth.session.id),
        () => {
          deleteCookie(c, deps.config.SESSION_COOKIE_NAME_FULL, {
            path: "/",
          });
          return c.json({ message: "로그아웃되었습니다." }, 200);
        },
      );
    },
  );
}
