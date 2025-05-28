import { EmailVerificationToken } from '../../../../domain/entity/email-verification.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 이메일 인증 토큰 리포지토리 인터페이스
 * 이메일 인증 토큰 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IEmailVerificationTokenRepository extends IBaseRepository<EmailVerificationToken> {
  /**
   * 토큰으로 이메일 인증 토큰 조회
   * @param token 인증 토큰
   * @returns 이메일 인증 토큰 또는 null
   */
  findByToken(token: string): Promise<EmailVerificationToken | null>;

  /**
   * 사용자 ID로 이메일 인증 토큰 조회
   * @param userId 사용자 ID
   * @returns 이메일 인증 토큰 또는 null
   */
  findByUserId(userId: number): Promise<EmailVerificationToken | null>;

  /**
   * 사용자 ID로 이메일 인증 토큰 삭제
   * @param userId 사용자 ID
   * @returns 삭제 성공 여부
   */
  deleteByUserId(userId: number): Promise<boolean>;

  /**
   * 만료된 이메일 인증 토큰 삭제
   * @returns 삭제된 토큰 수
   */
  deleteExpiredTokens(): Promise<number>;
}
