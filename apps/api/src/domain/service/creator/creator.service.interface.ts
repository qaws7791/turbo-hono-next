import { Creator } from '../../entity/creator.entity';
import { CreatorStatus } from '../../entity/creator.types';
import { Story } from '../../entity/story.entity';
import { PaginationOptions, PaginationResult } from '../service.types';

/**
 * 크리에이터 서비스 인터페이스
 * 크리에이터 관련 기능을 정의합니다.
 */
export interface ICreatorService {
  /**
   * 크리에이터 신청
   * @param userId 사용자 ID
   * @param data 크리에이터 신청 정보
   * @returns 생성된 크리에이터 정보
   */
  applyCreator(
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
  ): Promise<Creator>;

  /**
   * 내 크리에이터 프로필 조회
   * @param userId 현재 로그인한 사용자 ID
   * @returns 크리에이터 정보
   */
  getMyCreatorProfile(userId: number): Promise<Creator>;

  /**
   * 내 크리에이터 프로필 수정
   * @param userId 현재 로그인한 사용자 ID
   * @param data 수정할 정보
   * @returns 수정된 크리에이터 정보
   */
  updateMyCreatorProfile(
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
  ): Promise<Creator>;

  /**
   * 크리에이터 ID로 크리에이터 조회
   * @param id 크리에이터 ID
   * @returns 크리에이터 정보
   */
  getCreatorById(id: number): Promise<Creator>;

  /**
   * 크리에이터 상태 변경
   * @param id 크리에이터 ID
   * @param status 변경할 상태
   * @param rejectionReason 거부 사유 (상태가 REJECTED인 경우)
   * @returns 수정된 크리에이터 정보
   */
  updateCreatorStatus(
    id: number,
    status: CreatorStatus,
    rejectionReason?: string
  ): Promise<Creator>;

  /**
   * 크리에이터 스토리 목록 조회
   * @param creatorId 크리에이터 ID
   * @param options 페이지네이션 옵션
   * @returns 스토리 목록
   */
  getCreatorStories(
    creatorId: number,
    options: PaginationOptions
  ): Promise<PaginationResult<Story>>;

  /**
   * 크리에이터 팔로우
   * @param userId 현재 로그인한 사용자 ID
   * @param creatorId 팔로우할 크리에이터 ID
   */
  followCreator(userId: number, creatorId: number): Promise<void>;

  /**
   * 크리에이터 언팔로우
   * @param userId 현재 로그인한 사용자 ID
   * @param creatorId 언팔로우할 크리에이터 ID
   */
  unfollowCreator(userId: number, creatorId: number): Promise<void>;

  /**
   * 크리에이터 팔로우 여부 확인
   * @param userId 사용자 ID
   * @param creatorId 크리에이터 ID
   * @returns 팔로우 여부
   */
  isFollowing(userId: number, creatorId: number): Promise<boolean>;
}
