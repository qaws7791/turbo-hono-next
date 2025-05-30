import { CurationSpot } from '../../../../domain/entity/curation.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 큐레이션 스팟 리포지토리 인터페이스
 * 큐레이션 스팟 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ICurationSpotRepository extends IBaseRepository<CurationSpot> {
  /**
   * 이름으로 큐레이션 스팟 조회
   * @param name 큐레이션 스팟 이름
   * @returns 큐레이션 스팟 또는 null
   */
  findByName(name: string): Promise<CurationSpot | null>;

  /**
   * 슬러그로 큐레이션 스팟 조회
   * @param slug 큐레이션 스팟 슬러그
   * @returns 큐레이션 스팟 또는 null
   */
  findBySlug(slug: string): Promise<CurationSpot | null>;

}
