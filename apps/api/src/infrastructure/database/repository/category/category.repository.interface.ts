import { Category } from '../../../../domain/entity/category.entity';
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
   * 슬러그로 카테고리 조회
   * @param slug 카테고리 슬러그
   * @returns 카테고리 또는 null
   */
  findBySlug(slug: string): Promise<Category | null>;


  /**
   * 카테고리 사용 여부 확인
   * @param id 카테고리 ID
   * @returns 사용 여부
   */
  isInUse(id: number): Promise<boolean>;
}
