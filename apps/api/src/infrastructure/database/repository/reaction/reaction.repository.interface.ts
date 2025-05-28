import { Reaction } from '../../../../domain/entity/reaction.entity';
import { ReactionType } from '../../../domain/reaction.types';
import { IBaseRepository } from '../base.repository.interface';

/**
 * 리액션 리포지토리 인터페이스
 * 리액션 엔티티에 대한 데이터 접근 메서드를 정의합니다.
 */
export interface IReactionRepository extends IBaseRepository<Reaction> {
  /**
   * 사용자 ID로 리액션 목록 조회
   * @param userId 사용자 ID
   * @returns 리액션 배열
   */
  findByUserId(userId: number): Promise<Reaction[]>;

  /**
   * 스토리 ID로 리액션 목록 조회
   * @param storyId 스토리 ID
   * @returns 리액션 배열
   */
  findByStoryId(storyId: number): Promise<Reaction[]>;

  /**
   * 사용자 ID와 스토리 ID로 리액션 조회
   * @param userId 사용자 ID
   * @param storyId 스토리 ID
   * @returns 리액션 또는 null
   */
  findByUserIdAndStoryId(userId: number, storyId: number): Promise<Reaction | null>;

  /**
   * 스토리 ID와 리액션 타입으로 리액션 수 조회
   * @param storyId 스토리 ID
   * @param type 리액션 타입
   * @returns 리액션 수
   */
  countByStoryIdAndType(storyId: number, type: ReactionType): Promise<number>;

  /**
   * 스토리 ID로 리액션 수 조회
   * @param storyId 스토리 ID
   * @returns 리액션 수
   */
  countByStoryId(storyId: number): Promise<number>;

  /**
   * 사용자 ID와 스토리 ID로 리액션 삭제
   * @param userId 사용자 ID
   * @param storyId 스토리 ID
   * @returns 삭제 성공 여부
   */
  deleteByUserIdAndStoryId(userId: number, storyId: number): Promise<boolean>;
}
