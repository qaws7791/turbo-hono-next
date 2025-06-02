import { CookieOptions } from 'hono/utils/cookie';
import { Session } from '../../entity/session.entity';
import { User } from '../../entity/user.entity';
import { SocialProvider } from '../../entity/user.types';

/**
 * 인증 서비스 인터페이스
 * 사용자 인증 관련 기능을 정의합니다.
 */
export interface IAuthService {
  /**
   * 소셜 로그인 처리
   * @param provider 소셜 로그인 제공자
   * @param token 소셜 로그인 토큰
   * @returns 생성된 세션과 사용자 정보
   */
  socialLogin(
    provider: SocialProvider,
    token: string,
  ): Promise<{ session: Session; user: User }>;

  /**
   * 이메일 회원가입
   * @param email 이메일
   * @param password 비밀번호
   * @param name 이름
   * @returns 생성된 사용자 정보
   */
  registerWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<User>;

  /**
   * 이메일 로그인
   * @param email 이메일
   * @param password 비밀번호
   * @returns 생성된 세션과 사용자 정보
   */
  loginWithEmail(
    email: string,
    password: string
  ): Promise<{ session: Session; user: User }>;

  /**
   * 이메일 인증 토큰 생성
   * @param userId 사용자 ID
   * @returns 생성된 토큰
   */
  createEmailVerificationToken(userId: number): Promise<string>;

  /**
   * 이메일 인증 처리
   * @param token 인증 토큰
   * @returns 인증 성공 여부
   */
  verifyEmail(token: string): Promise<boolean>;

  /**
   * 세션 검증
   * @param token 세션 토큰
   * @returns 세션에 연결된 사용자 정보
   */
  validateSession(token: string): Promise<User | null>;

  /**
   * 로그아웃 처리
   * @param token 세션 토큰
   * @returns 로그아웃 성공 여부
   */
  logout(token: string): Promise<boolean>;

  /**
   * 세션 쿠키 옵션 가져오기
   * @returns 세션 쿠키 옵션
   */
  getSessionCookieOptions(): CookieOptions;


  /**
   * 세션 정보 가져오기
   * @param token 세션 토큰
   * @returns 세션 정보
   */
  getSession(token: string): Promise<Session | null>;
}
