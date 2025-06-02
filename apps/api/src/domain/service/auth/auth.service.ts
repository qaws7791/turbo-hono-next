import { env } from '@/common/config/env';
import { HTTPError } from '@/common/errors/http-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { Argon2PasswordService } from '@/infrastructure/auth/argon2password.service';
import { ResendService } from '@/infrastructure/email/resend.service';
import { KakaoOAuthService } from '@/infrastructure/oauth/kakao-oauth.service';
import { CookieOptions } from 'hono/utils/cookie';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import crypto from 'node:crypto';
import type { IAccountRepository } from '../../../infrastructure/database/repository/account/account.repository.interface';
import type { IEmailVerificationTokenRepository } from '../../../infrastructure/database/repository/email-verification/email-verification.repository.interface';
import type { ISessionRepository } from '../../../infrastructure/database/repository/session/session.repository.interface';
import { type IUserRepository } from '../../../infrastructure/database/repository/user/user.repository.interface';
import { Account } from '../../entity/account.entity';
import { EmailVerificationToken } from '../../entity/email-verification.entity';
import { Session } from '../../entity/session.entity';
import { User } from '../../entity/user.entity';
import { SocialProvider, UserStatus } from '../../entity/user.types';
import { IAuthService } from './auth.service.interface';

/**
 * 인증 서비스 구현
 */
@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(DI_SYMBOLS.UserRepository)
    private userRepository: IUserRepository,
    
    @inject(DI_SYMBOLS.AccountRepository)
    private accountRepository: IAccountRepository,
    
    @inject(DI_SYMBOLS.SessionRepository)
    private sessionRepository: ISessionRepository,
    
    @inject(DI_SYMBOLS.EmailVerificationTokenRepository)
    private emailVerificationTokenRepository: IEmailVerificationTokenRepository,

    @inject(DI_SYMBOLS.Argon2PasswordService)
    private passwordService: Argon2PasswordService,

    @inject(DI_SYMBOLS.KakaoOAuthService)
    private kakaoOAuthService: KakaoOAuthService,

    @inject(DI_SYMBOLS.ResendService)
    private resendService: ResendService,
  ) {}

  /**
   * 소셜 로그인 처리
   */
  async socialLogin(
    provider: SocialProvider,
    token: string,
  ): Promise<{ session: Session; user: User }> {

    let socialProfile: {
      id: string;
      nickname: string;
      email?: string;
      profileImageUrl?: string;
    } | null = null;

    if (provider === SocialProvider.KAKAO) {
      const {access_token} = await this.kakaoOAuthService.getTokensFromKakao(token);
      const kakaoProfile = await this.kakaoOAuthService.getUserInfoFromKakao(access_token);
      socialProfile = {
        id: kakaoProfile.id.toString(),
        nickname: kakaoProfile.properties?.nickname || kakaoProfile.kakao_account?.profile?.nickname || '이름없음',
        email: kakaoProfile.kakao_account?.email,
        profileImageUrl: kakaoProfile.properties?.profile_image || kakaoProfile.kakao_account?.profile?.profile_image_url,
      };
    }

    if (!socialProfile || !socialProfile.id || !socialProfile.nickname || !socialProfile.email || !socialProfile.profileImageUrl) {
      throw new HTTPError(
        {
          message: '소셜 로그인 정보를 찾을 수 없습니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 기존 계정 확인
    const existingAccount = await this.accountRepository.findByProviderAndProviderAccountId(
      provider,
      socialProfile.id
    );

    let user: User | null = null;

    if (existingAccount) {
      // 기존 계정이 있으면 해당 사용자 조회
      user = await this.userRepository.findById(existingAccount.userId);
      if (!user) {
        throw new Error('계정에 연결된 사용자를 찾을 수 없습니다.');
      }
    } else {
      // 이메일로 기존 사용자 확인 (이메일이 있는 경우)
      let existingUser: User | null = null;
      if (socialProfile.email) {
        existingUser = await this.userRepository.findByEmail(socialProfile.email);
      }

      if (existingUser) {
        // 기존 사용자가 있으면 소셜 계정 연결
        user = existingUser;
        const newAccount = Account.createSocialAccount(
          user.id,
          provider,
          socialProfile.id
        );
        await this.accountRepository.create(newAccount);
      } else {
        // 새 사용자 생성
        const newUser = User.create(
          socialProfile.nickname,
          socialProfile.email,
          socialProfile.profileImageUrl
        );
        user = await this.userRepository.create(newUser);

        // 소셜 계정 생성
        const newAccount = Account.createSocialAccount(
          user.id,
          provider,
          socialProfile.id,
        );
        await this.accountRepository.create(newAccount);
      }
    }

    const session = Session.create(user.id, token, undefined,null, null);
    await this.sessionRepository.create(session);

    return { session, user };
  }

  /**
   * 이메일 회원가입
   */
  async registerWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new HTTPError(
        {
          message: '이미 사용 중인 이메일입니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 사용자 생성
    const newUser = User.create(name, email);
    const user = await this.userRepository.create(newUser);

    // 비밀번호 해싱
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 이메일 계정 생성
    const account = Account.createEmailAccount(user.id, email, hashedPassword);
    await this.accountRepository.create(account);

    return user;
  }

  /**
   * 이메일 로그인
   */
  async loginWithEmail(
    email: string,
    password: string
  ): Promise<{ session: Session; user: User }> {
    // 이메일로 사용자 찾기
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new HTTPError(
        {
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 계정 찾기
    const account = await this.accountRepository.findByProviderAndProviderAccountId(
      SocialProvider.EMAIL,
      email
    );
    if (!account || !account.password) {
      throw new HTTPError(
        {
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await this.passwordService.verifyPassword(password, account.password);
    if (!isPasswordValid) {
      throw new HTTPError(
        {
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 계정 상태 확인
    if (user.status !== UserStatus.ACTIVE) {
      throw new HTTPError(
        {
          message: '비활성화된 계정입니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 세션 생성
    const token = this.generateToken();
    const session = Session.create(user.id, token, undefined, null, null);
    await this.sessionRepository.create(session);

    return { session, user };
  }

  /**
   * 이메일 인증 토큰 생성
   */
  async createEmailVerificationToken(userId: number): Promise<string> {
    // 사용자 확인
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HTTPError(
        {
          message: '사용자를 찾을 수 없습니다.',
        },
        status.NOT_FOUND,
      );
    }

    if (!user.email) {
      throw new HTTPError(
        {
          message: '사용자에게 이메일이 설정되어 있지 않습니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 기존 토큰 삭제
    await this.emailVerificationTokenRepository.deleteByUserId(userId);

    // 새 토큰 생성
    const token = this.generateToken(32);
    const verificationToken = EmailVerificationToken.create(userId, token);
    await this.emailVerificationTokenRepository.create(verificationToken);

    return token;
  }

  /**
   * 이메일 인증 처리
   */
  async verifyEmail(token: string): Promise<boolean> {
    // 토큰 찾기
    const verificationToken = await this.emailVerificationTokenRepository.findByToken(token);
    if (!verificationToken) {
      throw new HTTPError(
        {
          message: '유효하지 않은 토큰입니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 토큰 만료 확인
    if (verificationToken.isExpired()) {
      throw new HTTPError(
        {
          message: '만료된 토큰입니다.',
        },
        status.BAD_REQUEST,
      );
    }

    // 사용자 찾기
    const user = await this.userRepository.findById(verificationToken.userId);
    if (!user) {
      throw new HTTPError(
        {
          message: '사용자를 찾을 수 없습니다.',
        },
        status.NOT_FOUND,
      );
    }

    // 이메일 인증 처리
    user.verifyEmail();
    await this.userRepository.update(user);

    // 사용한 토큰 삭제
    await this.emailVerificationTokenRepository.deleteById(verificationToken.id);

    return true;
  }

  /**
   * 세션 검증
   */
  async validateSession(token: string): Promise<User | null> {
    // 세션 찾기
    const session = await this.sessionRepository.findByToken(token);
    if (!session) {
      return null;
    }

    // 세션 만료 확인
    if (session.isExpired()) {
      await this.sessionRepository.deleteById(session.id);
      return null;
    }

    // 사용자 찾기
    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      await this.sessionRepository.deleteById(session.id);
      return null;
    }

    // 계정 상태 확인
    if (user.status !== UserStatus.ACTIVE) {
      await this.sessionRepository.deleteById(session.id);
      return null;
    }

    return user;
  }

  /**
   * 로그아웃 처리
   */
  async logout(token: string): Promise<boolean> {
    // 세션 찾기
    const session = await this.sessionRepository.findByToken(token);
    if (!session) {
      return false;
    }

    // 세션 삭제
    await this.sessionRepository.deleteById(session.id);
    return true;
  }

  /**
   * 랜덤 토큰 생성
   */
  private generateToken(length = 64): string {
    return crypto.randomBytes(length).toString("hex");
  }

  getSessionCookieOptions(): CookieOptions {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    return {
      httpOnly: true,
      secure: env.COOKIE_SECURE === "true",
      sameSite: "Lax",
      domain: env.COOKIE_DOMAIN,
      expires: expires,
      path: "/",
    };
  }

  /**
   * 세션 정보 가져오기
   */
  async getSession(token: string): Promise<Session | null> {
    return this.sessionRepository.findByToken(token);
  }
}
