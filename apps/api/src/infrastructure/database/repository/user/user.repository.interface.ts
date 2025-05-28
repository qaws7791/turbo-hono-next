import { User } from '../../../../domain/entity/user.entity';
import { UserRole, UserStatus } from '../../../../domain/entity/user.types';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 사용자 리포지토리 인터페이스
 * 사용자 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IUserRepository extends IBaseRepository<User> {
  /**
   * 이메일로 사용자 조회
   * @param email 이메일
   * @returns 사용자 또는 null
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 역할로 사용자 목록 조회
   * @param role 사용자 역할
   * @returns 사용자 배열
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * 상태로 사용자 목록 조회
   * @param status 사용자 상태
   * @returns 사용자 배열
   */
  findByStatus(status: UserStatus): Promise<User[]>;

  /**
   * 역할과 상태로 사용자 목록 조회
   * @param role 사용자 역할
   * @param status 사용자 상태
   * @returns 사용자 배열
   */
  findByRoleAndStatus(role: UserRole, status: UserStatus): Promise<User[]>;
}
