import { DI_SYMBOLS } from '@/containers/di-symbols';
import { inject, injectable } from 'inversify';
import type { ICreatorRepository } from '../../../infrastructure/database/repository/creator/creator.repository.interface';
import type { ICurationItemRepository } from '../../../infrastructure/database/repository/curation/curation-item.repository.interface';
import type { ICurationSpotRepository } from '../../../infrastructure/database/repository/curation/curation-spot.repository.interface';
import type { IStoryRepository } from '../../../infrastructure/database/repository/story/story.repository.interface';
import { CurationItem, CurationSpot } from '../../entity/curation.entity';
import { CurationItemType } from '../../entity/curation.types';
import { ICurationService } from './curation.service.interface';

/**
 * 큐레이션 서비스 구현
 */
@injectable()
export class CurationService implements ICurationService {
  constructor(
    @inject(DI_SYMBOLS.CurationSpotRepository)
    private curationSpotRepository: ICurationSpotRepository,
    
    @inject(DI_SYMBOLS.CurationItemRepository)
    private curationItemRepository: ICurationItemRepository,
    
    @inject(DI_SYMBOLS.CreatorRepository)
    private creatorRepository: ICreatorRepository,
    
    @inject(DI_SYMBOLS.StoryRepository)
    private storyRepository: IStoryRepository
  ) {}

  /**
   * 모든 큐레이션 스팟 목록 조회
   */
  async getAllCurationSpots(): Promise<CurationSpot[]> {
    return this.curationSpotRepository.findAll();
  }

  /**
   * 큐레이션 스팟 ID로 스팟 조회
   */
  async getCurationSpotById(spotId: number): Promise<CurationSpot> {
    const spot = await this.curationSpotRepository.findById(spotId);
    if (!spot) {
      throw new Error('큐레이션 스팟을 찾을 수 없습니다.');
    }
    return spot;
  }

  /**
   * 큐레이션 스팟 슬러그로 스팟 조회
   */
  async getCurationSpotBySlug(slug: string): Promise<CurationSpot> {
    const spot = await this.curationSpotRepository.findBySlug(slug);
    if (!spot) {
      throw new Error('큐레이션 스팟을 찾을 수 없습니다.');
    }
    return spot;
  }

  /**
   * 큐레이션 스팟의 아이템 목록 조회
   */
  async getCurationItemsBySpotId(spotId: number): Promise<CurationItem[]> {
    // 스팟 존재 확인
    const spot = await this.curationSpotRepository.findById(spotId);
    if (!spot) {
      throw new Error('큐레이션 스팟을 찾을 수 없습니다.');
    }
    
    return this.curationItemRepository.findBySpotId(spotId);
  }

  /**
   * 큐레이션 스팟 생성 (관리자용)
   */
  async createCurationSpot(name: string, slug: string, description?: string): Promise<CurationSpot> {
    // 이름 중복 확인
    const existingByName = await this.curationSpotRepository.findByName(name);
    if (existingByName) {
      throw new Error('이미 존재하는 큐레이션 스팟 이름입니다.');
    }

    // 슬러그 중복 확인
    const existingBySlug = await this.curationSpotRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new Error('이미 존재하는 큐레이션 스팟 슬러그입니다.');
    }

    const spot = CurationSpot.create(name, slug, description || null);
    return this.curationSpotRepository.create(spot);
  }

  /**
   * 큐레이션 스팟 수정 (관리자용)
   */
  async updateCurationSpot(
    spotId: number,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
    }
  ): Promise<CurationSpot> {
    const spot = await this.curationSpotRepository.findById(spotId);
    if (!spot) {
      throw new Error('큐레이션 스팟을 찾을 수 없습니다.');
    }

    // 이름 업데이트
    if (data.name !== undefined) {
      // 이름 중복 확인
      const existingByName = await this.curationSpotRepository.findByName(data.name);
      if (existingByName && existingByName.id !== spotId) {
        throw new Error('이미 존재하는 큐레이션 스팟 이름입니다.');
      }
      spot.updateName(data.name);
    }

    // 슬러그 업데이트
    if (data.slug !== undefined) {
      // 슬러그 중복 확인
      const existingBySlug = await this.curationSpotRepository.findBySlug(data.slug);
      if (existingBySlug && existingBySlug.id !== spotId) {
        throw new Error('이미 존재하는 큐레이션 스팟 슬러그입니다.');
      }
      spot.updateSlug(data.slug);
    }

    // 설명 업데이트
    if (data.description !== undefined) {
      spot.updateDescription(data.description);
    }

    // 저장
    await this.curationSpotRepository.update(spot);
    return spot;
  }

  /**
   * 큐레이션 스팟 삭제 (관리자용)
   */
  async deleteCurationSpot(spotId: number): Promise<void> {
    const spot = await this.curationSpotRepository.findById(spotId);
    if (!spot) {
      throw new Error('큐레이션 스팟을 찾을 수 없습니다.');
    }

    // 스팟에 포함된 아이템 모두 삭제
    await this.curationItemRepository.deleteBySpotId(spotId);
    
    // 스팟 삭제
    await this.curationSpotRepository.deleteById(spotId);
  }

  /**
   * 큐레이션 아이템 추가 (관리자용)
   */
  async addCurationItem(
    spotId: number,
    itemType: CurationItemType,
    itemId: number,
    position: number = 0
  ): Promise<CurationItem> {
    // 스팟 존재 확인
    const spot = await this.curationSpotRepository.findById(spotId);
    if (!spot) {
      throw new Error('큐레이션 스팟을 찾을 수 없습니다.');
    }

    // 아이템 타입에 따라 존재 확인
    if (itemType === CurationItemType.CREATOR) {
      const creator = await this.creatorRepository.findById(itemId);
      if (!creator) {
        throw new Error('크리에이터를 찾을 수 없습니다.');
      }
      
      // 활성화된 크리에이터만 추가 가능
      if (!creator.isActive()) {
        throw new Error('활성화된 크리에이터만 큐레이션에 추가할 수 있습니다.');
      }
      
      // 중복 확인
      const existingItem = await this.curationItemRepository.findBySpotIdAndCreatorId(spotId, itemId);
      if (existingItem) {
        throw new Error('이미 해당 스팟에 추가된 크리에이터입니다.');
      }
      
      // 아이템 생성
      const item = CurationItem.createForCreator(spotId, itemId, position);
      return this.curationItemRepository.create(item);
    } else if (itemType === CurationItemType.STORY) {
      const story = await this.storyRepository.findById(itemId);
      if (!story) {
        throw new Error('스토리를 찾을 수 없습니다.');
      }
      
      // 공개된 스토리만 추가 가능
      if (!story.isVisible()) {
        throw new Error('공개된 스토리만 큐레이션에 추가할 수 있습니다.');
      }
      
      // 중복 확인
      const existingItem = await this.curationItemRepository.findBySpotIdAndStoryId(spotId, itemId);
      if (existingItem) {
        throw new Error('이미 해당 스팟에 추가된 스토리입니다.');
      }
      
      // 아이템 생성
      const item = CurationItem.createForStory(spotId, itemId, position);
      return this.curationItemRepository.create(item);
    } else {
      throw new Error('지원하지 않는 아이템 유형입니다.');
    }
  }

  /**
   * 큐레이션 아이템 위치 변경 (관리자용)
   */
  async updateCurationItemPosition(itemId: number, position: number): Promise<CurationItem> {
    const item = await this.curationItemRepository.findById(itemId);
    if (!item) {
      throw new Error('큐레이션 아이템을 찾을 수 없습니다.');
    }

    item.updatePosition(position);
    await this.curationItemRepository.update(item);
    return item;
  }

  /**
   * 큐레이션 아이템 삭제 (관리자용)
   */
  async deleteCurationItem(itemId: number): Promise<void> {
    const item = await this.curationItemRepository.findById(itemId);
    if (!item) {
      throw new Error('큐레이션 아이템을 찾을 수 없습니다.');
    }

    await this.curationItemRepository.deleteById(itemId);
  }
}
