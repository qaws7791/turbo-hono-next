import { createOpenAPI } from "@/api/helpers/openapi";
import { env } from "@/common/config/env";
import { APIResponse } from "@/common/utils/response";
import { container } from "@/containers";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { SocialProvider } from "@/domain/entity/user.types";
import { IAuthService } from "@/domain/service/auth/auth.service.interface";
import { ResendService } from "@/infrastructure/email/resend.service";
import { KakaoOAuthService } from "@/infrastructure/oauth/kakao-oauth.service";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import status from "http-status";
import * as routes from "./auth.routes";

const platformAuth = createOpenAPI();

const authService = container.get<IAuthService>(DI_SYMBOLS.AuthService);
const resendService = container.get<ResendService>(DI_SYMBOLS.ResendService);
const kakaoOAuthService = container.get<KakaoOAuthService>(DI_SYMBOLS.KakaoOAuthService);

platformAuth.openapi(routes.loginWithKakao, (c) => {
  const redirectUrl = kakaoOAuthService.getKakaoLoginUrl();
  return c.redirect(redirectUrl);
});

platformAuth.openapi(routes.kakaoSocialLogin, async (c) => {
  const { token } = await c.req.valid("json");
  const { session } = await authService.socialLogin(
    SocialProvider.KAKAO,
    token
  );
  const cookieOptions = authService.getSessionCookieOptions();

  setCookie(
    c,
    env.SESSION_COOKIE_NAME || "session",
    session.token,
    cookieOptions
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
    console.error("No session token");
    const response = APIResponse.error({
      "code": "code",
      "message": "message"
    }, status.UNAUTHORIZED)
    return c.json(response, status.UNAUTHORIZED)
  }

  const session = await authService.getSession(sessionToken);
  if (!session) {
    console.error("No session");
    const response = APIResponse.error({
      "code": "code",
      "message": "message"
    }, status.UNAUTHORIZED)
    return c.json(response, status.UNAUTHORIZED)
  }

  const response = APIResponse.success({
    userId: session.userId,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
  })
  return c.json(response, status.OK)
});

platformAuth.openapi(routes.emailLogin, async (c) => {
  const { email, password } = await c.req.valid("json");

  const { session } = await authService.loginWithEmail(email, password);

  const cookieOptions = authService.getSessionCookieOptions();
  setCookie(
    c,
    env.SESSION_COOKIE_NAME || "session",
    session.token,
    cookieOptions,
  );

  return c.newResponse(null, status.CREATED);
});

platformAuth.openapi(routes.emailRegister, async (c) => {
  const { email, password, name } = await c.req.valid("json");

  const user = await authService.registerWithEmail(
    email,
    password,
    name,
  );

  const verificationToken = await authService.createEmailVerificationToken(user.id);

  const result = await resendService.sendEmail(
    email,
    "이메일 인증 메일",
    `이메일 인증 메일입니다. 아래 링크를 클릭하여 이메일 인증을 완료해주세요.
    ${env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
  );

  if (!result) {
    console.error(`userId:${user.id} - 이메일 인증 메일 전송 실패`);
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
