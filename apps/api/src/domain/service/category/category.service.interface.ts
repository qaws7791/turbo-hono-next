import { Category } from '../../entity/category.entity';

/**
 * 카테고리 서비스 인터페이스
 * 카테고리 관련 기능을 정의합니다.
 */
export interface ICategoryService {
  /**
   * 모든 카테고리 목록 조회
   * @returns 카테고리 목록
   */
  getAllCategories(): Promise<Category[]>;

  /**
   * 카테고리 ID로 카테고리 조회
   * @param id 카테고리 ID
   * @returns 카테고리 정보
   */
  getCategoryById(id: number): Promise<Category>;

  /**
   * 카테고리 슬러그로 카테고리 조회
   * @param slug 카테고리 슬러그
   * @returns 카테고리 정보
   */
  getCategoryBySlug(slug: string): Promise<Category>;

  /**
   * 카테고리 생성 (관리자용)
   * @param name 카테고리 이름
   * @param slug 카테고리 슬러그
   * @returns 생성된 카테고리 정보
   */
  createCategory(name: string, slug: string): Promise<Category>;

  /**
   * 카테고리 수정 (관리자용)
   * @param id 카테고리 ID
   * @param data 수정할 정보
   * @returns 수정된 카테고리 정보
   */
  updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
    }
  ): Promise<Category>;

  /**
   * 카테고리 삭제 (관리자용)
   * @param id 카테고리 ID
   */
  deleteCategory(id: number): Promise<void>;
}
