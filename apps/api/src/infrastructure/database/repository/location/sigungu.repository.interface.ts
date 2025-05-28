import { Sigungu } from '../../../domain/sigungu.entity';
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
   * 코드로 시군구 조회
   * @param code 시군구 코드
   * @returns 시군구 또는 null
   */
  findByCode(code: string): Promise<Sigungu | null>;

  /**
   * 시도 ID로 시군구 목록 조회
   * @param sidoId 시도 ID
   * @returns 시군구 배열
   */
  findBySidoId(sidoId: number): Promise<Sigungu[]>;
}
