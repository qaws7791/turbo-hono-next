import { Account } from '../../../../domain/entity/account.entity';
import { SocialProvider } from '../../../../domain/entity/user.types';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 계정 리포지토리 인터페이스
 * 계정 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IAccountRepository extends IBaseRepository<Account> {
  /**
   * 사용자 ID로 계정 목록 조회
   * @param userId 사용자 ID
   * @returns 계정 배열
   */
  findByUserId(userId: number): Promise<Account[]>;

  /**
   * 제공자와 제공자 계정 ID로 계정 조회
   * @param providerId 제공자 ID
   * @param providerAccountId 제공자 계정 ID
   * @returns 계정 또는 null
   */
  findByProviderAndProviderAccountId(
    providerId: SocialProvider,
    providerAccountId: string
  ): Promise<Account | null>;

  /**
   * 사용자 ID로 계정 삭제
   * @param userId 사용자 ID
   * @returns 삭제 성공 여부
   */
  deleteByUserId(userId: number): Promise<boolean>;
}
