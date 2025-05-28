import { Creator } from '../../../../domain/entity/creator.entity';
import { CreatorStatus } from '../../../../domain/entity/creator.types';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 크리에이터 리포지토리 인터페이스
 * 크리에이터 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ICreatorRepository extends IBaseRepository<Creator> {
  /**
   * 사용자 ID로 크리에이터 조회
   * @param userId 사용자 ID
   * @returns 크리에이터 또는 null
   */
  findByUserId(userId: number): Promise<Creator | null>;

  /**
   * 브랜드명으로 크리에이터 조회
   * @param brandName 브랜드명
   * @returns 크리에이터 또는 null
   */
  findByBrandName(brandName: string): Promise<Creator | null>;

  /**
   * 상태로 크리에이터 목록 조회
   * @param status 크리에이터 상태
   * @returns 크리에이터 배열
   */
  findByStatus(status: CreatorStatus): Promise<Creator[]>;

  /**
   * 카테고리 ID로 크리에이터 목록 조회
   * @param categoryId 카테고리 ID
   * @returns 크리에이터 배열
   */
  findByCategoryId(categoryId: number): Promise<Creator[]>;

  /**
   * 시도 ID로 크리에이터 목록 조회
   * @param sidoId 시도 ID
   * @returns 크리에이터 배열
   */
  findBySidoId(sidoId: number): Promise<Creator[]>;

  /**
   * 시군구 ID로 크리에이터 목록 조회
   * @param sigunguId 시군구 ID
   * @returns 크리에이터 배열
   */
  findBySigunguId(sigunguId: number): Promise<Creator[]>;
}
