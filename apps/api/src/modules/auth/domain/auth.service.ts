import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { EMAIL_SERVICE_CONFIG } from "../../../shared/config/email-service.config";
import type { AuthRepository } from "../data-access/auth.repository";
import type { SessionRepository } from "../data-access/session.repository";
import type { KakaoService } from "../external/kakao-oauth.service";
import type { MagicLinkService } from "../external/magic-link.service";
import { MagicLinkEntity, SessionEntity, UserEntity } from "./auth.entity";
import {
  AuthenticationError,
  InvalidTokenError,
  KakaoAuthError,
  SessionExpiredError,
  TokenAlreadyUsedError,
  TokenExpiredError,
  UserNotFoundError,
} from "./auth.errors";
import type {
  AuthResponse,
  EmailSentResponse,
  EmailSigninRequest,
  EmailSignupRequest,
  EmailVerifyRequest,
  KakaoSigninRequest,
  Session,
  User,
} from "./auth.types";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.AuthRepository)
    private readonly authRepository: AuthRepository,
    @inject(TYPES.SessionRepository)
    private readonly sessionRepository: SessionRepository,
    @inject(TYPES.MagicLinkService)
    private readonly magicLinkService: MagicLinkService,
    @inject(TYPES.KakaoService) private readonly kakaoService: KakaoService,
  ) {}

  async emailSignup(request: EmailSignupRequest): Promise<EmailSentResponse> {
    const { email } = request;

    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AuthenticationError("User already exists with this email");
    }

    // Create magic link
    const magicLinkData = MagicLinkEntity.create(
      email,
      "signup",
      EMAIL_SERVICE_CONFIG.MAGIC_LINK_EXPIRY_MINUTES,
    );

    const magicLink = await this.authRepository.createMagicLink(magicLinkData);

    // Send email
    await this.magicLinkService.sendMagicLinkEmail({
      email,
      token: magicLink.token,
      type: "signup",
      expiresIn: EMAIL_SERVICE_CONFIG.MAGIC_LINK_EXPIRY_MINUTES,
    });

    return {
      message: "Verification email sent",
      email,
      expiresIn: EMAIL_SERVICE_CONFIG.MAGIC_LINK_EXPIRY_MINUTES,
    };
  }

  async emailSignin(request: EmailSigninRequest): Promise<EmailSentResponse> {
    const { email } = request;

    // Check if user exists
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (!existingUser) {
      throw new UserNotFoundError("No account found with this email");
    }

    // Create magic link
    const magicLinkData = MagicLinkEntity.create(
      email,
      "signin",
      EMAIL_SERVICE_CONFIG.MAGIC_LINK_EXPIRY_MINUTES,
    );

    const magicLink = await this.authRepository.createMagicLink(magicLinkData);

    // Send email
    await this.magicLinkService.sendMagicLinkEmail({
      email,
      token: magicLink.token,
      type: "signin",
      expiresIn: EMAIL_SERVICE_CONFIG.MAGIC_LINK_EXPIRY_MINUTES,
    });

    return {
      message: "Sign-in email sent",
      email,
      expiresIn: EMAIL_SERVICE_CONFIG.MAGIC_LINK_EXPIRY_MINUTES,
    };
  }

  async verifyEmail(request: EmailVerifyRequest): Promise<AuthResponse> {
    const { token } = request;

    // Find magic link
    const magicLink = await this.authRepository.findMagicLinkByToken(token);
    if (!magicLink) {
      throw new InvalidTokenError("Invalid verification token");
    }

    const magicLinkEntity = new MagicLinkEntity(
      magicLink.id,
      magicLink.email,
      magicLink.token,
      magicLink.type,
      magicLink.isUsed,
      magicLink.usedAt,
      magicLink.expiresAt,
      magicLink.createdAt,
    );

    // Validate magic link
    if (!magicLinkEntity.canBeUsed()) {
      if (magicLinkEntity.isExpired()) {
        throw new TokenExpiredError("Verification link has expired");
      }
      if (magicLinkEntity.isUsed) {
        throw new TokenAlreadyUsedError(
          "Verification link has already been used",
        );
      }
    }

    let user: User;

    if (magicLink.type === "signup") {
      // Check if user already exists (race condition protection)
      const existingUser = await this.authRepository.findUserByEmail(
        magicLink.email,
      );
      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user
        const username = this.generateUsername(magicLink.email);
        const displayName = username;

        const userData = UserEntity.create({
          email: magicLink.email,
          username,
          displayName,
        });

        user = await this.authRepository.createUser(userData);
      }
    } else {
      // Sign in - user should exist
      const existingUser = await this.authRepository.findUserByEmail(
        magicLink.email,
      );
      if (!existingUser) {
        throw new UserNotFoundError("User account not found");
      }
      user = existingUser;
    }

    // Mark magic link as used
    await this.authRepository.markMagicLinkAsUsed(magicLink.id);

    // Create session
    const sessionData = SessionEntity.create(user.id, 24 * 7); // 7 days
    const session = await this.sessionRepository.createSession(
      user.id,
      sessionData.expiresAt,
    );

    return {
      user,
      session,
    };
  }

  async kakaoSignin(request: KakaoSigninRequest): Promise<AuthResponse> {
    const {
      code,
      redirectUri = `${EMAIL_SERVICE_CONFIG.FRONTEND_URL}/auth/kakao/callback`,
    } = request;

    try {
      // Get access token from Kakao
      const accessToken = await this.kakaoService.getAccessToken(
        code,
        redirectUri,
      );

      // Get user info from Kakao
      const kakaoUser = await this.kakaoService.getUserInfo(accessToken);

      // Check if account already exists
      const existingAccount = await this.authRepository.findAccountByProvider(
        "kakao",
        kakaoUser.id,
      );

      let user: User;

      if (existingAccount) {
        // User exists, sign them in
        const existingUser = await this.authRepository.findUserById(
          existingAccount.userId,
        );
        if (!existingUser) {
          throw new UserNotFoundError("Associated user account not found");
        }
        user = existingUser;
      } else {
        // Check if user with same email exists
        const existingUser = await this.authRepository.findUserByEmail(
          kakaoUser.email,
        );

        if (existingUser) {
          // Link Kakao account to existing user
          await this.authRepository.createAccount({
            userId: existingUser.id,
            provider: "kakao",
            providerAccountId: kakaoUser.id,
          });
          user = existingUser;
        } else {
          // Create new user
          const username = this.generateUsername(kakaoUser.email);

          const userData = UserEntity.create({
            email: kakaoUser.email,
            username,
            displayName: kakaoUser.name,
            profileImage: kakaoUser.profileImage,
          });

          user = await this.authRepository.createUser(userData);

          // Link Kakao account
          await this.authRepository.createAccount({
            userId: user.id,
            provider: "kakao",
            providerAccountId: kakaoUser.id,
          });
        }
      }

      // Create session
      const sessionData = SessionEntity.create(user.id, 24 * 7); // 7 days
      const session = await this.sessionRepository.createSession(
        user.id,
        sessionData.expiresAt,
      );

      return {
        user,
        session,
      };
    } catch (error) {
      console.error("Kakao authentication error:", error);
      throw new KakaoAuthError("Failed to authenticate with Kakao");
    }
  }

  async validateSession(
    token: string,
  ): Promise<{ user: User; session: Session }> {
    const session = await this.sessionRepository.findSessionByToken(token);
    if (!session) {
      throw new AuthenticationError("Invalid session token");
    }

    const sessionEntity = new SessionEntity(
      session.id,
      session.userId,
      session.token,
      session.expiresAt,
      session.createdAt,
    );

    if (!sessionEntity.isValid()) {
      throw new SessionExpiredError("Session has expired");
    }

    const user = await this.authRepository.findUserById(session.userId);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return { user, session };
  }

  async signOut(token: string): Promise<void> {
    await this.sessionRepository.invalidateSession(token);
  }

  async signOutAll(userId: number): Promise<void> {
    await this.sessionRepository.invalidateAllUserSessions(userId);
  }

  private generateUsername(email: string): string {
    const baseUsername = email.split("@")[0].toLowerCase();
    // Remove non-alphanumeric characters and ensure it's valid
    const cleanUsername = baseUsername.replace(/[^a-z0-9]/g, "");

    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6);
    return `${cleanUsername}${timestamp}`;
  }

  // Cleanup methods (to be called by background jobs)
  async cleanupExpiredTokens(): Promise<void> {
    await Promise.all([
      this.authRepository.cleanupExpiredMagicLinks(),
      this.sessionRepository.cleanupExpiredSessions(),
    ]);
  }
}
