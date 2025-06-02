import { Reaction } from '../../entity/reaction.entity';
import { Story } from '../../entity/story.entity';
import { ReactionType } from '../../entity/story.types';
import { PaginationOptions, PaginationResult } from '../service.types';

/**
 * 스토리 서비스 인터페이스
 * 스토리 관련 기능을 정의합니다.
 */
export interface IStoryService {
  /**
   * 스토리 생성
   * @param userId 현재 로그인한 사용자 ID
   * @param data 스토리 생성 정보
   * @returns 생성된 스토리 정보
   */
  createStory(
    userId: number,
    data: {
      title: string;
      content: string;
      coverImageUrl?: string | null;
    }
  ): Promise<Story>;

  /**
   * 스토리 수정
   * @param userId 현재 로그인한 사용자 ID
   * @param storyId 스토리 ID
   * @param data 수정할 정보
   * @returns 수정된 스토리 정보
   */
  updateStory(
    userId: number,
    storyId: number,
    data: {
      title?: string;
      content?: string;
      coverImageUrl?: string | null;
    }
  ): Promise<Story>;

  /**
   * 스토리 삭제
   * @param userId 현재 로그인한 사용자 ID
   * @param storyId 스토리 ID
   */
  deleteStory(userId: number, storyId: number): Promise<void>;

  /**
   * 스토리 조회
   * @param storyId 스토리 ID
   * @returns 스토리 정보
   */
  getStoryById(storyId: number): Promise<Story>;

  /**
   * 스토리 목록 조회
   * @param options 페이지네이션 옵션
   * @returns 스토리 목록
   */
  listStories(options: PaginationOptions): Promise<PaginationResult<Story>>;

  /**
   * 스토리 반응 추가 또는 수정
   * @param userId 현재 로그인한 사용자 ID
   * @param storyId 스토리 ID
   * @param reactionType 반응 유형
   * @returns 생성 또는 수정된 반응 정보
   */
  updateReaction(
    userId: number,
    storyId: number,
    reactionType: ReactionType
  ): Promise<Reaction>;

  /**
   * 스토리 반응 조회
   * @param userId 사용자 ID
   * @param storyId 스토리 ID
   * @returns 반응 정보 (없으면 null)
   */
  getReaction(userId: number, storyId: number): Promise<Reaction | null>;

  /**
   * 스토리 반응 삭제
   * @param userId 현재 로그인한 사용자 ID
   * @param storyId 스토리 ID
   */
  deleteReaction(userId: number, storyId: number): Promise<void>;


  /**
   * 스토리 반응 카운트 조회
   * @param storyId 스토리 ID
   * @returns 스토리 반응 카운트
   */
  getReactionCount(storyId: number): Promise<{ [key in ReactionType]: number }>;
}
