import { Sido } from '../../../../domain/entity/location.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 시도 리포지토리 인터페이스
 * 시도 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ISidoRepository extends IBaseRepository<Sido> {
  /**
   * 이름으로 시도 조회
   * @param name 시도 이름
   * @returns 시도 또는 null
   */
  findByName(name: string): Promise<Sido | null>;

}
