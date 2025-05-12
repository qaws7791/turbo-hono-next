import { env } from "@/config/env";
import { AccountRepository } from "@/db/repositories/account.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { UserRepository } from "@/db/repositories/user.repository";
import { SessionSelect } from "@/db/types";
import { KakaoAuthService } from "@/services/kakao-auth.service";
import crypto from "crypto";
import { type CookieOptions } from "hono/utils/cookie"; // Hono 쿠키 타입
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
    @inject("kakaoAuthService")
    private readonly kakaoAuthService: KakaoAuthService,
  ) {}

  /**
   * Kakao 콜백 처리 및 사용자 인증/세션 생성
   * @param authorizationCode Kakao 인가 코드
   * @param ipAddress 요청 IP 주소
   * @param userAgent 요청 User Agent
   * @returns 생성된 세션 토큰
   */
  async handleKakaoCallback(
    authorizationCode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    console.log("kakaoAuthService", this.kakaoAuthService);
    const kakaoTokens =
      await this.kakaoAuthService.getTokensFromKakao(authorizationCode);
    const accessToken = kakaoTokens.access_token;
    const kakaoUserInfo =
      await this.kakaoAuthService.getUserInfoFromKakao(accessToken);

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

    const sessionToken = this.generateSessionToken();
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

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
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
}
