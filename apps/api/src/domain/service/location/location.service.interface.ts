import { Sido, Sigungu } from '../../entity/location.entity';

/**
 * 위치 서비스 인터페이스
 * 시도 및 시군구 관련 기능을 정의합니다.
 */
export interface ILocationService {
  /**
   * 모든 시도 목록 조회
   * @returns 시도 목록
   */
  getAllSido(): Promise<Sido[]>;

  /**
   * 시도 ID로 시도 조회
   * @param sidoId 시도 ID
   * @returns 시도 정보
   */
  getSidoById(sidoId: number): Promise<Sido>;

  /**
   * 시도에 속한 시군구 목록 조회
   * @param sidoId 시도 ID
   * @returns 시군구 목록
   */
  getSigunguBySidoId(sidoId: number): Promise<Sigungu[]>;

  /**
   * 시군구 ID로 시군구 조회
   * @param sigunguId 시군구 ID
   * @returns 시군구 정보
   */
  getSigunguById(sigunguId: number): Promise<Sigungu>;

  /**
   * 시도 생성 (관리자용)
   * @param name 시도 이름
   * @returns 생성된 시도 정보
   */
  createSido(name: string): Promise<Sido>;

  /**
   * 시군구 생성 (관리자용)
   * @param sidoId 시도 ID
   * @param name 시군구 이름
   * @returns 생성된 시군구 정보
   */
  createSigungu(sidoId: number, name: string): Promise<Sigungu>;
}
