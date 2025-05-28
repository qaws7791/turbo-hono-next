import { DI_SYMBOLS } from '@/containers/di-symbols';
import { inject, injectable } from 'inversify';
import type { ICreatorRepository } from '../../../infrastructure/database/repository/creator/creator.repository.interface';
import type { IFollowRepository } from '../../../infrastructure/database/repository/follow/follow.repository.interface';
import type { IStoryRepository } from '../../../infrastructure/database/repository/story/story.repository.interface';
import type { IUserRepository } from '../../../infrastructure/database/repository/user/user.repository.interface';
import { Creator } from '../../entity/creator.entity';
import { CreatorStatus } from '../../entity/creator.types';
import { Follow } from '../../entity/follow.entity';
import { Story } from '../../entity/story.entity';
import { PaginationOptions, PaginationResult } from '../service.types';
import { ICreatorService } from './creator.service.interface';

/**
 * 크리에이터 서비스 구현
 */
@injectable()
export class CreatorService implements ICreatorService {
  constructor(
    @inject(DI_SYMBOLS.CreatorRepository)
    private creatorRepository: ICreatorRepository,
    
    @inject(DI_SYMBOLS.UserRepository)
    private userRepository: IUserRepository,
    
    @inject(DI_SYMBOLS.StoryRepository)
    private storyRepository: IStoryRepository,
    
    @inject(DI_SYMBOLS.FollowRepository)
    private followRepository: IFollowRepository
  ) {}

  /**
   * 크리에이터 신청
   */
  async applyCreator(
    userId: number,
    data: {
      brandName: string;
      bio?: string;
      profileImageUrl?: string;
      coverImageUrl?: string;
      sidoId?: number;
      sigunguId?: number;
      categoryId?: number;
    }
  ): Promise<Creator> {
    // 사용자 확인
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 이미 크리에이터인지 확인
    const existingCreator = await this.creatorRepository.findByUserId(userId);
    if (existingCreator) {
      throw new Error('이미 크리에이터 신청을 했거나 크리에이터입니다.');
    }

    // 브랜드명 중복 확인
    const existingBrandName = await this.creatorRepository.findByBrandName(data.brandName);
    if (existingBrandName) {
      throw new Error('이미 사용 중인 브랜드명입니다.');
    }

    // 크리에이터 생성
    const creator = Creator.apply(
      userId,
      data.brandName,
      data.bio || null,
      data.profileImageUrl || null,
      data.coverImageUrl || null,
      data.sidoId || null,
      data.sigunguId || null,
      data.categoryId || null
    );

    // 저장
    const createdCreator = await this.creatorRepository.create(creator);
    return createdCreator;
  }

  /**
   * 내 크리에이터 프로필 조회
   */
  async getMyCreatorProfile(userId: number): Promise<Creator> {
    const creator = await this.creatorRepository.findByUserId(userId);
    if (!creator) {
      throw new Error('크리에이터 프로필을 찾을 수 없습니다.');
    }
    return creator;
  }

  /**
   * 내 크리에이터 프로필 수정
   */
  async updateMyCreatorProfile(
    userId: number,
    data: {
      brandName?: string;
      bio?: string | null;
      profileImageUrl?: string | null;
      coverImageUrl?: string | null;
      sidoId?: number | null;
      sigunguId?: number | null;
      categoryId?: number | null;
    }
  ): Promise<Creator> {
    // 크리에이터 조회
    const creator = await this.creatorRepository.findByUserId(userId);
    if (!creator) {
      throw new Error('크리에이터 프로필을 찾을 수 없습니다.');
    }

    // 활성화된 크리에이터인지 확인
    if (!creator.isActive()) {
      throw new Error('활성화된 크리에이터만 프로필을 수정할 수 있습니다.');
    }

    // 브랜드명 업데이트
    if (data.brandName !== undefined) {
      // 브랜드명 중복 확인
      const existingBrandName = await this.creatorRepository.findByBrandName(data.brandName);
      if (existingBrandName && existingBrandName.id !== creator.id) {
        throw new Error('이미 사용 중인 브랜드명입니다.');
      }
      creator.updateBrandName(data.brandName);
    }

    // 소개 업데이트
    if (data.bio !== undefined) {
      creator.updateBio(data.bio);
    }

    // 프로필 이미지 업데이트
    if (data.profileImageUrl !== undefined) {
      creator.updateProfileImage(data.profileImageUrl);
    }

    // 커버 이미지 업데이트
    if (data.coverImageUrl !== undefined) {
      creator.updateCoverImage(data.coverImageUrl);
    }

    // 위치 업데이트
    if (data.sidoId !== undefined || data.sigunguId !== undefined) {
      creator.updateLocation(
        data.sidoId !== undefined ? data.sidoId : creator.sidoId,
        data.sigunguId !== undefined ? data.sigunguId : creator.sigunguId
      );
    }

    // 카테고리 업데이트
    if (data.categoryId !== undefined) {
      creator.updateCategory(data.categoryId);
    }

    // 저장
    await this.creatorRepository.update(creator);
    return creator;
  }

  /**
   * 크리에이터 ID로 크리에이터 조회
   */
  async getCreatorById(id: number): Promise<Creator> {
    const creator = await this.creatorRepository.findById(id);
    if (!creator) {
      throw new Error('크리에이터를 찾을 수 없습니다.');
    }

    // 활성화된 크리에이터만 조회 가능
    if (!creator.isActive()) {
      throw new Error('활성화된 크리에이터만 조회할 수 있습니다.');
    }

    return creator;
  }

  /**
   * 크리에이터 상태 변경
   */
  async updateCreatorStatus(
    id: number,
    status: CreatorStatus,
    rejectionReason?: string
  ): Promise<Creator> {
    const creator = await this.creatorRepository.findById(id);
    if (!creator) {
      throw new Error('크리에이터를 찾을 수 없습니다.');
    }

    // 상태에 따른 처리
    switch (status) {
      case CreatorStatus.APPROVED:
        creator.approve();
        break;
      case CreatorStatus.REJECTED:
        if (!rejectionReason) {
          throw new Error('거부 사유가 필요합니다.');
        }
        creator.reject(rejectionReason);
        break;
      case CreatorStatus.ACTIVE:
        creator.activate();
        
        // 사용자 역할 업데이트
        const user = await this.userRepository.findById(creator.userId);
        if (user) {
          user.promoteToCreator();
          await this.userRepository.update(user);
        }
        break;
      case CreatorStatus.INACTIVE:
        creator.deactivate();
        break;
      case CreatorStatus.SUSPENDED:
        creator.suspend();
        break;
      default:
        throw new Error('지원하지 않는 상태입니다.');
    }

    // 저장
    await this.creatorRepository.update(creator);
    return creator;
  }

  /**
   * 크리에이터 스토리 목록 조회
   */
  async getCreatorStories(
    creatorId: number,
    options: PaginationOptions
  ): Promise<PaginationResult<Story>> {
    // 크리에이터 확인
    const creator = await this.creatorRepository.findById(creatorId);
    if (!creator) {
      throw new Error('크리에이터를 찾을 수 없습니다.');
    }

    // 활성화된 크리에이터만 스토리 조회 가능
    if (!creator.isActive()) {
      throw new Error('활성화된 크리에이터의 스토리만 조회할 수 있습니다.');
    }

    // 스토리 조회
    return this.storyRepository.findByCreatorId(creatorId, options);
  }

  /**
   * 크리에이터 팔로우
   */
  async followCreator(userId: number, creatorId: number): Promise<void> {
    // 크리에이터 확인
    const creator = await this.creatorRepository.findById(creatorId);
    if (!creator) {
      throw new Error('크리에이터를 찾을 수 없습니다.');
    }

    // 활성화된 크리에이터만 팔로우 가능
    if (!creator.isActive()) {
      throw new Error('활성화된 크리에이터만 팔로우할 수 있습니다.');
    }

    // 사용자 확인
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 자기 자신을 팔로우하는지 확인
    if (creator.userId === userId) {
      throw new Error('자기 자신을 팔로우할 수 없습니다.');
    }

    // 이미 팔로우 중인지 확인
    const existingFollow = await this.followRepository.findByFollowerAndFollowing(userId, creatorId);
    if (existingFollow) {
      return; // 이미 팔로우 중이면 무시
    }

    // 팔로우 생성
    const follow = Follow.create(userId, creatorId);
    await this.followRepository.create(follow);
  }

  /**
   * 크리에이터 언팔로우
   */
  async unfollowCreator(userId: number, creatorId: number): Promise<void> {
    // 팔로우 관계 확인
    const follow = await this.followRepository.findByFollowerAndFollowing(userId, creatorId);
    if (!follow) {
      return; // 팔로우 중이 아니면 무시
    }

    // 팔로우 삭제
    await this.followRepository.deleteById(follow.id);
  }

  /**
   * 크리에이터 팔로우 여부 확인
   */
  async isFollowing(userId: number, creatorId: number): Promise<boolean> {
    const follow = await this.followRepository.findByFollowerAndFollowing(userId, creatorId);
    return !!follow;
  }
}
