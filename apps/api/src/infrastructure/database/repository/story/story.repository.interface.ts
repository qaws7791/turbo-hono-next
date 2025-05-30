import { PaginationOptions, PaginationResult } from '@/infrastructure/database/repository/repository.types';
import { Story } from '../../../../domain/entity/story.entity';
import { StoryStatus } from '../../../../domain/entity/story.types';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 스토리 리포지토리 인터페이스
 * 스토리 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IStoryRepository extends IBaseRepository<Story> {
  /**
   * 크리에이터 ID로 스토리 목록 조회
   * @param creatorId 크리에이터 ID
   * @returns 스토리 배열
   */
  findByCreatorId(creatorId: number, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>>;

  /**
   * 상태로 스토리 목록 조회
   * @param status 스토리 상태
   * @returns 스토리 배열
   */
  findByStatus(status: StoryStatus, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>>;

  /**
   * 카테고리 ID로 스토리 목록 조회
   * @param categoryId 카테고리 ID
   * @returns 스토리 배열
   */
  findByCategoryId(categoryId: number, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>>;

  /**
   * 크리에이터 ID와 상태로 스토리 목록 조회
   * @param creatorId 크리에이터 ID
   * @param status 스토리 상태
   * @returns 스토리 배열
   */
  findByCreatorIdAndStatus({ creatorId, status }: { creatorId: number; status: StoryStatus }, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>>;

  /**
   * 제목 검색으로 스토리 목록 조회
   * @param title 검색할 제목 키워드
   * @returns 스토리 배열
   */
  searchByTitle(title: string, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>>;

  /**
   * 내용 검색으로 스토리 목록 조회
   * @param content 검색할 내용 키워드
   * @returns 스토리 배열
   */
  searchByContent(content: string, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>>;
}
