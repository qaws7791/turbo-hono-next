import { PaginationOptions, PaginationResult } from '../../../domain/service/service.types';
import { Filter, SortOptions } from './repository.types';

/**
 * 기본 리포지토리 인터페이스
 * 모든 리포지토리가 구현해야 하는 기본 메서드를 정의합니다.
 */
export interface IBaseRepository<T> {
  /**
   * ID로 엔티티 조회
   * @param id 엔티티 ID
   * @returns 엔티티 또는 null
   */
  findById(id: number): Promise<T | null>;

  /**
   * 모든 엔티티 조회
   * @param filter 필터 (선택)
   * @param sort 정렬 옵션 (선택)
   * @returns 엔티티 배열
   */
  findAll(filter?: Filter<T>, sort?: SortOptions<T>[]): Promise<T[]>;

  /**
   * 페이지네이션을 적용하여 엔티티 조회
   * @param options 페이지네이션 옵션
   * @param filter 필터 (선택)
   * @param sort 정렬 옵션 (선택)
   * @returns 페이지네이션 결과
   */
  findWithPagination(
    options: PaginationOptions,
    filter?: Filter<T>,
    sort?: SortOptions<T>[]
  ): Promise<PaginationResult<T>>;

  /**
   * 엔티티 생성
   * @param entity 생성할 엔티티
   * @returns 생성된 엔티티
   */
  create(entity: T): Promise<T>;

  /**
   * 엔티티 업데이트
   * @param entity 업데이트할 엔티티
   * @returns 업데이트된 엔티티
   */
  update(entity: T): Promise<T>;

  /**
   * ID로 엔티티 삭제
   * @param id 삭제할 엔티티 ID
   * @returns 삭제 성공 여부
   */
  deleteById(id: number): Promise<boolean>;
}
