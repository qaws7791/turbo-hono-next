import { StoryDetailResponseSchema, StorySummaryResponseSchema } from '@/application/dtos/platform/story.dto';
import { z } from 'zod';
import { PaginationOptions, PaginationResult } from '../service.types';

/**
 * 스토리 쿼리 서비스 인터페이스
 * 스토리 조회 관련 기능을 정의합니다.
 */
export interface IStoryQueryService {


  /**
   * 스토리 상세 조회
   * @param id 스토리 ID
   * @returns 스토리 상세 정보
   */
  getStoryDetailById(id: number): Promise<z.infer<typeof StoryDetailResponseSchema>>;

  /**
   * 스토리 목록 조회
   * @param options 페이지네이션 옵션
   * @returns 스토리 목록
   */
  listStories(
    options: PaginationOptions
  ): Promise<PaginationResult<z.infer<typeof StorySummaryResponseSchema>>>;

}
