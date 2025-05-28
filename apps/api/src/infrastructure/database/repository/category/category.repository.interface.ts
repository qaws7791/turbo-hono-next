import { Category } from '../../../../domain/entity/category.entity';
import { CategoryType } from '../../../domain/category.types';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 카테고리 리포지토리 인터페이스
 * 카테고리 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface ICategoryRepository extends IBaseRepository<Category> {
  /**
   * 이름으로 카테고리 조회
   * @param name 카테고리 이름
   * @returns 카테고리 또는 null
   */
  findByName(name: string): Promise<Category | null>;

  /**
   * 타입으로 카테고리 목록 조회
   * @param type 카테고리 타입
   * @returns 카테고리 배열
   */
  findByType(type: CategoryType): Promise<Category[]>;

  /**
   * 부모 ID로 카테고리 목록 조회
   * @param parentId 부모 카테고리 ID
   * @returns 카테고리 배열
   */
  findByParentId(parentId: number): Promise<Category[]>;

  /**
   * 루트 카테고리 목록 조회 (부모가 없는 카테고리)
   * @returns 카테고리 배열
   */
  findRootCategories(): Promise<Category[]>;
}
