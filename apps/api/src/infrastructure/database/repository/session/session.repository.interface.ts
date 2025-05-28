import { Session } from '../../../../domain/entity/session.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 세션 리포지토리 인터페이스
 * 세션 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ISessionRepository extends IBaseRepository<Session> {
  /**
   * 토큰으로 세션 조회
   * @param token 세션 토큰
   * @returns 세션 또는 null
   */
  findByToken(token: string): Promise<Session | null>;

  /**
   * 사용자 ID로 세션 목록 조회
   * @param userId 사용자 ID
   * @returns 세션 배열
   */
  findByUserId(userId: number): Promise<Session[]>;

  /**
   * 사용자 ID로 세션 삭제
   * @param userId 사용자 ID
   * @returns 삭제 성공 여부
   */
  deleteByUserId(userId: number): Promise<boolean>;

  /**
   * 만료된 세션 삭제
   * @returns 삭제된 세션 수
   */
  deleteExpiredSessions(): Promise<number>;
}
