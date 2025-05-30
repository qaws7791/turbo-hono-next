import { Sigungu } from '../../../../domain/entity/location.entity';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 시군구 리포지토리 인터페이스
 * 시군구 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ISigunguRepository extends IBaseRepository<Sigungu> {
  /**
   * 이름으로 시군구 조회
   * @param name 시군구 이름
   * @returns 시군구 또는 null
   */
  findByName(name: string): Promise<Sigungu | null>;

  /**
   * 시도 ID로 시군구 목록 조회
   * @param sidoId 시도 ID
   * @returns 시군구 배열
   */
  findBySidoId(sidoId: number): Promise<Sigungu[]>;

  /**
   * 시도 ID와 이름으로 시군구 조회
   * @param sidoId 시도 ID
   * @param name 시군구 이름
   * @returns 시군구 또는 null
   */
  findByNameInSido(sidoId: number, name: string): Promise<Sigungu | null>;
}
