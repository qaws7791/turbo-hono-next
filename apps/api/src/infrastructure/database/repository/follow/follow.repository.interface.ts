import { Follow } from '../../../../domain/entity/follow.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 팔로우 리포지토리 인터페이스
 * 팔로우 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IFollowRepository extends IBaseRepository<Follow> {
  /**
   * 사용자 ID로 팔로우 목록 조회 (사용자가 팔로우한 크리에이터 목록)
   * @param userId 사용자 ID
   * @returns 팔로우 배열
   */
  findByUserId(userId: number): Promise<Follow[]>;

  /**
   * 크리에이터 ID로 팔로우 목록 조회 (크리에이터를 팔로우한 사용자 목록)
   * @param creatorId 크리에이터 ID
   * @returns 팔로우 배열
   */
  findByCreatorId(creatorId: number): Promise<Follow[]>;

  /**
   * 사용자 ID와 크리에이터 ID로 팔로우 조회
   * @param userId 사용자 ID
   * @param creatorId 크리에이터 ID
   * @returns 팔로우 또는 null
   */
  findByUserIdAndCreatorId(userId: number, creatorId: number): Promise<Follow | null>;

  /**
   * 크리에이터 ID로 팔로워 수 조회
   * @param creatorId 크리에이터 ID
   * @returns 팔로워 수
   */
  countByCreatorId(creatorId: number): Promise<number>;

  /**
   * 사용자 ID로 팔로잉 수 조회
   * @param userId 사용자 ID
   * @returns 팔로잉 수
   */
  countByUserId(userId: number): Promise<number>;

  /**
   * 사용자 ID와 크리에이터 ID로 팔로우 삭제
   * @param userId 사용자 ID
   * @param creatorId 크리에이터 ID
   * @returns 삭제 성공 여부
   */
  deleteByUserIdAndCreatorId(userId: number, creatorId: number): Promise<boolean>;
}
