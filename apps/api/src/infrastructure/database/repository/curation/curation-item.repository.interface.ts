import { CurationItem } from '../../../../domain/entity/curation.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 큐레이션 아이템 리포지토리 인터페이스
 * 큐레이션 아이템 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ICurationItemRepository extends IBaseRepository<CurationItem> {
  /**
   * 큐레이션 스팟 ID로 큐레이션 아이템 목록 조회
   * @param spotId 큐레이션 스팟 ID
   * @returns 큐레이션 아이템 배열
   */
  findBySpotId(spotId: number): Promise<CurationItem[]>;

  /**
   * 크리에이터 ID로 큐레이션 아이템 목록 조회
   * @param creatorId 크리에이터 ID
   * @returns 큐레이션 아이템 배열
   */
  findByCreatorId(creatorId: number): Promise<CurationItem[]>;

  /**
   * 스토리 ID로 큐레이션 아이템 목록 조회
   * @param storyId 스토리 ID
   * @returns 큐레이션 아이템 배열
   */
  findByStoryId(storyId: number): Promise<CurationItem[]>;

  /**
   * 큐레이션 스팟 ID와 크리에이터 ID로 큐레이션 아이템 조회
   * @param spotId 큐레이션 스팟 ID
   * @param creatorId 크리에이터 ID
   * @returns 큐레이션 아이템 또는 null
   */
  findBySpotIdAndCreatorId(spotId: number, creatorId: number): Promise<CurationItem | null>;

  /**
   * 큐레이션 스팟 ID와 스토리 ID로 큐레이션 아이템 조회
   * @param spotId 큐레이션 스팟 ID
   * @param storyId 스토리 ID
   * @returns 큐레이션 아이템 또는 null
   */
  findBySpotIdAndStoryId(spotId: number, storyId: number): Promise<CurationItem | null>;

  /**
   * 큐레이션 스팟 ID로 큐레이션 아이템 삭제
   * @param spotId 큐레이션 스팟 ID
   * @returns 삭제 성공 여부
   */
  deleteBySpotId(spotId: number): Promise<boolean>;

  /**
   * 큐레이션 아이템 전체 업데이트
   * @param items 업데이트할 큐레이션 아이템 배열
   * @returns 업데이트된 큐레이션 아이템 배열
   */
  updateMany(items: CurationItem[]): Promise<CurationItem[]>;
}
