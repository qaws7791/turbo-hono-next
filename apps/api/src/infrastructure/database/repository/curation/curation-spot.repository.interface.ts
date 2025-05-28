import { CurationSpot } from '../../../domain/curation-spot.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 큐레이션 스팟 리포지토리 인터페이스
 * 큐레이션 스팟 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ICurationSpotRepository extends IBaseRepository<CurationSpot> {
  /**
   * 제목으로 큐레이션 스팟 조회
   * @param title 큐레이션 스팟 제목
   * @returns 큐레이션 스팟 또는 null
   */
  findByTitle(title: string): Promise<CurationSpot | null>;

  /**
   * 활성화된 큐레이션 스팟 목록 조회
   * @returns 활성화된 큐레이션 스팟 배열
   */
  findActive(): Promise<CurationSpot[]>;

  /**
   * 비활성화된 큐레이션 스팟 목록 조회
   * @returns 비활성화된 큐레이션 스팟 배열
   */
  findInactive(): Promise<CurationSpot[]>;
}
