import { CurationItem, CurationSpot } from '../../entity/curation.entity';
import { CurationItemType } from '../../entity/curation.types';

/**
 * 큐레이션 서비스 인터페이스
 * 큐레이션 관련 기능을 정의합니다.
 */
export interface ICurationService {
  /**
   * 모든 큐레이션 스팟 목록 조회
   * @returns 큐레이션 스팟 목록
   */
  getAllCurationSpots(): Promise<CurationSpot[]>;

  /**
   * 큐레이션 스팟 ID로 스팟 조회
   * @param spotId 큐레이션 스팟 ID
   * @returns 큐레이션 스팟 정보
   */
  getCurationSpotById(spotId: number): Promise<CurationSpot>;

  /**
   * 큐레이션 스팟 슬러그로 스팟 조회
   * @param slug 큐레이션 스팟 슬러그
   * @returns 큐레이션 스팟 정보
   */
  getCurationSpotBySlug(slug: string): Promise<CurationSpot>;

  /**
   * 큐레이션 스팟의 아이템 목록 조회
   * @param spotId 큐레이션 스팟 ID
   * @returns 큐레이션 아이템 목록
   */
  getCurationItemsBySpotId(spotId: number): Promise<CurationItem[]>;

  /**
   * 큐레이션 스팟 생성 (관리자용)
   * @param name 큐레이션 스팟 이름
   * @param slug 큐레이션 스팟 슬러그
   * @param description 큐레이션 스팟 설명 (선택)
   * @returns 생성된 큐레이션 스팟 정보
   */
  createCurationSpot(name: string, slug: string, description?: string): Promise<CurationSpot>;

  /**
   * 큐레이션 스팟 수정 (관리자용)
   * @param spotId 큐레이션 스팟 ID
   * @param data 수정할 정보
   * @returns 수정된 큐레이션 스팟 정보
   */
  updateCurationSpot(
    spotId: number,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
    }
  ): Promise<CurationSpot>;

  /**
   * 큐레이션 스팟 삭제 (관리자용)
   * @param spotId 큐레이션 스팟 ID
   */
  deleteCurationSpot(spotId: number): Promise<void>;

  /**
   * 큐레이션 아이템 추가 (관리자용)
   * @param spotId 큐레이션 스팟 ID
   * @param itemType 아이템 유형
   * @param itemId 아이템 ID (크리에이터 또는 스토리 ID)
   * @returns 생성된 큐레이션 아이템 정보
   */
  addCurationItem(
    spotId: number,
    itemType: CurationItemType,
    itemId: number,
  ): Promise<CurationItem>;

  /**
   * 큐레이션 전체 아이템 위치 변경 (관리자용)
   * @param spotId 큐레이션 스팟 ID
   * @param itemOrders 아이템 ID와 위치의 배열
   * @returns 수정된 큐레이션 아이템 정보
   */
  updateBulkCurationItemPosition(spotId: number, itemOrders: { itemId: number; position: number }[]): Promise<CurationItem[]>;

  /**
   * 큐레이션 아이템 삭제 (관리자용)
   * @param itemId 큐레이션 아이템 ID
   */
  deleteCurationItem(itemId: number): Promise<void>;
}
