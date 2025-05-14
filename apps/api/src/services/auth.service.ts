import { env } from "@/config/env";
import { AccountRepository } from "@/db/repositories/account.repository";
import { EmailVerificationTokenRepository } from "@/db/repositories/email-verification-token.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { UserRepository } from "@/db/repositories/user.repository";
import { SessionSelect } from "@/db/types";
import { HTTPError } from "@/errors/http-error";
import kakaoOAuth from "@/lib/oauth/kakao";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateToken } from "@/utils/token";
import { type CookieOptions } from "hono/utils/cookie"; // Hono 쿠키 타입
import status from "http-status";
import { inject, injectable } from "inversify";
import { users } from "../db/schema"; // Drizzle 스키마 타입 추론용

const SESSION_EXPIRY_DAYS = 30;
const SESSION_RENEWAL_THRESHOLD_DAYS = 15; // 15일 이하 남았을 때 갱신

@injectable()
export class AuthService {
  constructor(
    @inject("userRepository")
    private readonly userRepository: UserRepository,
    @inject("accountRepository")
    private readonly accountRepository: AccountRepository,
    @inject("sessionRepository")
    private readonly sessionRepository: SessionRepository,
    @inject("emailVerificationTokenRepository")
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
  ) {}

  /**
   * Kakao 콜백 처리 및 사용자 인증/세션 생성
   * @param authorizationCode Kakao 인가 코드
   * @param ipAddress 요청 IP 주소
   * @param userAgent 요청 User Agent
   * @returns 생성된 세션 토큰
   */
  async loginWithKakao(
    authorizationCode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const kakaoTokens = await kakaoOAuth.getTokensFromKakao(authorizationCode);
    const accessToken = kakaoTokens.access_token;
    const kakaoUserInfo = await kakaoOAuth.getUserInfoFromKakao(accessToken);
    console.log(kakaoUserInfo);
    const providerId = "kakao";
    const providerAccountId = kakaoUserInfo.id.toString();
    const kakaoEmail = kakaoUserInfo.kakao_account?.email;
    const kakaoNickname =
      kakaoUserInfo.properties?.nickname ||
      kakaoUserInfo.kakao_account?.profile?.nickname ||
      "이름없음";
    const kakaoProfileImage =
      kakaoUserInfo.properties?.profile_image ||
      kakaoUserInfo.kakao_account?.profile?.profile_image_url;
    const isEmailVerified = kakaoUserInfo.kakao_account?.is_email_verified;

    let userId: number;

    const existingAccount =
      await this.accountRepository.findAccountByProviderAndId(
        providerId,
        providerAccountId,
      );

    if (existingAccount) {
      userId = existingAccount.userId;
    } else {
      let existingUserByEmail = undefined;
      if (kakaoEmail) {
        existingUserByEmail =
          await this.userRepository.findUserByEmail(kakaoEmail);
      }

      if (existingUserByEmail) {
        userId = existingUserByEmail.id;
        await this.accountRepository.createAccount({
          userId: userId,
          providerId: providerId,
          providerAccountId: providerAccountId,
        });
      } else {
        const newUser = await this.userRepository.createUser({
          name: kakaoNickname,
          email: kakaoEmail,
          emailVerified: kakaoEmail && isEmailVerified ? new Date() : null,
          profileImageUrl: kakaoProfileImage,
        });
        userId = newUser.id;
        await this.accountRepository.createAccount({
          userId: userId,
          providerId: providerId,
          providerAccountId: providerAccountId,
        });
      }
    }

    const sessionToken = await this.generateUserSession({
      userId,
      ipAddress,
      userAgent,
    });

    return sessionToken;
  }

  async loginWithEmail(
    email: string,
    password: string,
  ): Promise<{ sessionToken: string }> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HTTPError(
        {
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
        status.UNAUTHORIZED,
      );
    }

    const account = await this.accountRepository.findAccountByUserId(user.id);
    if (!account || !account.password) {
      throw new HTTPError(
        {
          message: "잘못된 계정 정보입니다.",
        },
        status.UNAUTHORIZED,
      );
    }

    const isValidPassword = await verifyPassword(password, account.password);
    if (!isValidPassword) {
      throw new HTTPError(
        {
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
        status.UNAUTHORIZED,
      );
    }

    if (!user.emailVerified) {
      throw new HTTPError(
        {
          message: "이메일 인증이 필요합니다.",
        },
        status.UNAUTHORIZED,
      );
    }

    const sessionToken = await this.generateUserSession({
      userId: user.id,
    });

    return { sessionToken };
  }

  async registerWithEmail(
    email: string,
    password: string,
    name: string,
  ): Promise<{ userId: number; verificationToken: string }> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new HTTPError(
        {
          message: "이미 등록된 이메일입니다.",
        },
        status.CONFLICT,
      );
    }

    const user = await this.userRepository.createUser({
      email,
      name,
      role: "user",
      status: "active",
    });

    const passwordHash = await hashPassword(password);
    await this.accountRepository.createAccount({
      userId: user.id,
      providerId: "email",
      providerAccountId: email,
      password: passwordHash,
    });

    const verificationToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.emailVerificationTokenRepository.createToken({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });

    return {
      userId: user.id,
      verificationToken,
    };
  }

  /**
   * 세션 토큰 검증 및 유효한 사용자 정보 반환
   * @param token 세션 토큰
   * @returns 유효한 사용자 정보 또는 undefined
   */
  async validateSession(
    token: string,
  ): Promise<typeof users.$inferSelect | undefined> {
    const session = await this.sessionRepository.findSessionByToken(token);

    if (!session) {
      return undefined;
    }

    const now = new Date();
    const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
    const daysUntilExpiry = timeUntilExpiry / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry <= SESSION_RENEWAL_THRESHOLD_DAYS) {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + SESSION_EXPIRY_DAYS);
      try {
        await this.sessionRepository.updateSessionExpiresAt(
          session.id,
          newExpiresAt,
        );
        console.log(
          `Session ${session.id} renewed until ${newExpiresAt.toISOString()}`,
        );
      } catch (error) {
        console.error("Failed to renew session:", error);
      }
    }

    const user = await this.userRepository.findUserById(session.userId);

    if (!user) {
      console.error(`User not found for session ${session.id}`);
      await this.sessionRepository.deleteSessionByToken(token);
      return undefined;
    }

    return user;
  }

  /**
   * 세션 토큰으로 세션 삭제 (로그아웃)
   * @param token 세션 토큰
   */
  async logout(token: string): Promise<void> {
    if (token) {
      await this.sessionRepository.deleteSessionByToken(token);
    }
  }

  getSessionCookieOptions(): CookieOptions {
    const expires = new Date();
    expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

    return {
      httpOnly: true,
      secure: env.COOKIE_SECURE === "true",
      sameSite: "Lax",
      domain: env.COOKIE_DOMAIN,
      expires: expires,
      path: "/",
    };
  }

  async getSession(token: string): Promise<SessionSelect | undefined> {
    return this.sessionRepository.findSessionByToken(token);
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken =
      await this.emailVerificationTokenRepository.findValidTokenByToken(token);

    if (!verificationToken) {
      throw new HTTPError(
        {
          message: "유효하지 않거나 만료된 인증 토큰입니다.",
        },
        status.BAD_REQUEST,
      );
    }
    try {
      await this.userRepository.updateEmailVerified(
        verificationToken.userId,
        true,
      );
      await this.emailVerificationTokenRepository.deleteTokenByUserId(
        verificationToken.userId,
      );
    } catch (error) {
      console.error("Failed to verify email:", error);
      throw new HTTPError(
        {
          message: "이메일 인증 처리 중 오류가 발생했습니다.",
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateUserSession({
    userId,
    ipAddress,
    userAgent,
  }: {
    userId: number;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
  }) {
    const sessionToken = generateToken(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await this.sessionRepository.createSession({
      userId: userId,
      token: sessionToken,
      expiresAt: expiresAt,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
    return sessionToken;
  }
}
