import { DI_SYMBOLS } from '@/containers/di-symbols';
import { inject, injectable } from 'inversify';
import type { ICreatorRepository } from '../../../infrastructure/database/repository/creator/creator.repository.interface';
import type { IReactionRepository } from '../../../infrastructure/database/repository/reaction/reaction.repository.interface';
import type { IStoryRepository } from '../../../infrastructure/database/repository/story/story.repository.interface';
import type { IUserRepository } from '../../../infrastructure/database/repository/user/user.repository.interface';
import { Reaction } from '../../entity/reaction.entity';
import { Story } from '../../entity/story.entity';
import { ReactionType, StoryStatus } from '../../entity/story.types';
import { PaginationOptions, PaginationResult } from '../service.types';
import { IStoryService } from './story.service.interface';

/**
 * 스토리 서비스 구현
 */
@injectable()
export class StoryService implements IStoryService {
  constructor(
    @inject(DI_SYMBOLS.StoryRepository)
    private storyRepository: IStoryRepository,
    
    @inject(DI_SYMBOLS.CreatorRepository)
    private creatorRepository: ICreatorRepository,
    
    @inject(DI_SYMBOLS.ReactionRepository)
    private reactionRepository: IReactionRepository,
    
    @inject(DI_SYMBOLS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  /**
   * 스토리 생성
   */
  async createStory(
    userId: number,
    data: {
      title: string;
      content: string;
      coverImageUrl?: string | null;
      categoryId?: number | null;
    }
  ): Promise<Story> {
    // 사용자의 크리에이터 정보 조회
    const creator = await this.creatorRepository.findByUserId(userId);
    if (!creator) {
      throw new Error('크리에이터 프로필을 찾을 수 없습니다.');
    }

    // 활성화된 크리에이터인지 확인
    if (!creator.canCreateStory()) {
      throw new Error('활성화된 크리에이터만 스토리를 작성할 수 있습니다.');
    }

    // 스토리 생성
    const story = Story.create(
      creator.id,
      data.title,
      data.content,
      data.coverImageUrl || null,
      data.categoryId || null
    );

    // 저장
    const createdStory = await this.storyRepository.create(story);
    return createdStory;
  }

  /**
   * 스토리 수정
   */
  async updateStory(
    userId: number,
    storyId: number,
    data: {
      title?: string;
      content?: string;
      coverImageUrl?: string | null;
      categoryId?: number | null;
    }
  ): Promise<Story> {
    // 스토리 조회
    const story = await this.storyRepository.findById(storyId);
    if (!story) {
      throw new Error('스토리를 찾을 수 없습니다.');
    }

    // 사용자의 크리에이터 정보 조회
    const creator = await this.creatorRepository.findByUserId(userId);
    if (!creator) {
      throw new Error('크리에이터 프로필을 찾을 수 없습니다.');
    }

    // 스토리 작성자 확인
    if (story.authorId !== creator.id) {
      throw new Error('자신이 작성한 스토리만 수정할 수 있습니다.');
    }

    // 삭제된 스토리인지 확인
    if (story.isDeleted()) {
      throw new Error('삭제된 스토리는 수정할 수 없습니다.');
    }

    // 제목 업데이트
    if (data.title !== undefined) {
      story.updateTitle(data.title);
    }

    // 내용 업데이트
    if (data.content !== undefined) {
      story.updateContent(data.content);
    }

    // 커버 이미지 업데이트
    if (data.coverImageUrl !== undefined) {
      story.updateCoverImage(data.coverImageUrl);
    }

    // 카테고리 업데이트
    if (data.categoryId !== undefined) {
      story.updateCategory(data.categoryId);
    }

    // 저장
    await this.storyRepository.update(story);
    return story;
  }

  /**
   * 스토리 삭제
   */
  async deleteStory(userId: number, storyId: number): Promise<void> {
    // 스토리 조회
    const story = await this.storyRepository.findById(storyId);
    if (!story) {
      throw new Error('스토리를 찾을 수 없습니다.');
    }

    // 사용자의 크리에이터 정보 조회
    const creator = await this.creatorRepository.findByUserId(userId);
    if (!creator) {
      throw new Error('크리에이터 프로필을 찾을 수 없습니다.');
    }

    // 스토리 작성자 확인
    if (story.authorId !== creator.id) {
      throw new Error('자신이 작성한 스토리만 삭제할 수 있습니다.');
    }

    // 이미 삭제된 스토리인지 확인
    if (story.isDeleted()) {
      return; // 이미 삭제된 스토리면 무시
    }

    // 스토리 삭제 처리
    story.delete();
    await this.storyRepository.update(story);
  }

  /**
   * 스토리 조회
   */
  async getStoryById(storyId: number): Promise<Story> {
    const story = await this.storyRepository.findById(storyId);
    if (!story) {
      throw new Error('스토리를 찾을 수 없습니다.');
    }

    // 공개된 스토리만 조회 가능
    if (!story.isVisible()) {
      throw new Error('공개된 스토리만 조회할 수 있습니다.');
    }

    return story;
  }

  /**
   * 스토리 목록 조회
   */
  async listStories(options: PaginationOptions): Promise<PaginationResult<Story>> {
    // 공개된 스토리만 조회
    return this.storyRepository.findAll(options, { status: StoryStatus.PUBLISHED });
  }

  /**
   * 스토리 반응 추가 또는 수정
   */
  async updateReaction(
    userId: number,
    storyId: number,
    reactionType: ReactionType
  ): Promise<Reaction> {
    // 스토리 조회
    const story = await this.storyRepository.findById(storyId);
    if (!story) {
      throw new Error('스토리를 찾을 수 없습니다.');
    }

    // 공개된 스토리만 반응 가능
    if (!story.isVisible()) {
      throw new Error('공개된 스토리에만 반응할 수 있습니다.');
    }

    // 사용자 확인
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 기존 반응 확인
    const existingReaction = await this.reactionRepository.findByUserAndStory(userId, storyId);

    if (existingReaction) {
      // 기존 반응 업데이트
      existingReaction.updateReactionType(reactionType);
      await this.reactionRepository.update(existingReaction);
      return existingReaction;
    } else {
      // 새 반응 생성
      const reaction = Reaction.create(storyId, userId, reactionType);
      return this.reactionRepository.create(reaction);
    }
  }

  /**
   * 스토리 반응 조회
   */
  async getReaction(userId: number, storyId: number): Promise<Reaction | null> {
    return this.reactionRepository.findByUserAndStory(userId, storyId);
  }

  /**
   * 스토리 반응 삭제
   */
  async deleteReaction(userId: number, storyId: number): Promise<void> {
    const reaction = await this.reactionRepository.findByUserAndStory(userId, storyId);
    if (reaction) {
      await this.reactionRepository.deleteById(reaction.id);
    }
  }
}
