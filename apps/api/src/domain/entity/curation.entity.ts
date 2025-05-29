import { CurationItemType } from './curation.types';

/**
 * 큐레이션 스팟 엔티티
 * 앱 내에서 특정 위치에 표시되는 큐레이션 영역을 나타냅니다.
 */
export class CurationSpot {
  constructor(
    private readonly _id: number,
    private _name: string,
    private _slug: string,
    private _description: string | null,
    private _coverImageUrl: string | null,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | null {
    return this._description;
  }

  get coverImageUrl(): string | null {
    return this._coverImageUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setters with validation
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('큐레이션 스팟 이름은 비어있을 수 없습니다.');
    }
    this._name = name;
  }

  updateSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw new Error('큐레이션 스팟 슬러그는 비어있을 수 없습니다.');
    }
    
    // 슬러그 형식 검증 (소문자, 숫자, 하이픈만 허용)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      throw new Error('슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다.');
    }
    
    this._slug = slug;
  }

  updateDescription(description: string | null): void {
    this._description = description;
  }

  updateCoverImageUrl(coverImageUrl: string | null): void {
    this._coverImageUrl = coverImageUrl;
  }

  // 팩토리 메서드
  static create(
    name: string,
    slug: string,
    description: string | null = null,
    coverImageUrl: string | null = null,
    createdAt: Date,
    updatedAt: Date,
  ): CurationSpot {
    if (!name || name.trim().length === 0) {
      throw new Error('큐레이션 스팟 이름은 비어있을 수 없습니다.');
    }
    
    if (!slug || slug.trim().length === 0) {
      throw new Error('큐레이션 스팟 슬러그는 비어있을 수 없습니다.');
    }
    
    // 슬러그 형식 검증 (소문자, 숫자, 하이픈만 허용)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      throw new Error('슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다.');
    }
    
    return new CurationSpot(
      0, // ID는 저장 시 할당
      name,
      slug,
      description,
      coverImageUrl,
      createdAt,
      updatedAt,
    );
  }
}

/**
 * 큐레이션 아이템 엔티티
 * 큐레이션 스팟에 표시되는 개별 아이템(크리에이터 또는 스토리)을 나타냅니다.
 */
export class CurationItem {
  constructor(
    private readonly _id: number,
    private readonly _spotId: number,
    private readonly _itemType: CurationItemType,
    private readonly _creatorId: number | null,
    private readonly _storyId: number | null,
    private _position: number,
    private readonly _createdAt: Date,
  ) {
    // 아이템 타입에 따라 필수 ID 검증
    if (this._itemType === CurationItemType.CREATOR && this._creatorId === null) {
      throw new Error('크리에이터 타입 큐레이션 아이템은 creatorId가 필요합니다.');
    }
    
    if (this._itemType === CurationItemType.STORY && this._storyId === null) {
      throw new Error('스토리 타입 큐레이션 아이템은 storyId가 필요합니다.');
    }
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get spotId(): number {
    return this._spotId;
  }

  get itemType(): CurationItemType {
    return this._itemType;
  }

  get creatorId(): number | null {
    return this._creatorId;
  }

  get storyId(): number | null {
    return this._storyId;
  }

  get position(): number {
    return this._position;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Setters with validation
  updatePosition(position: number): void {
    if (position < 0) {
      throw new Error('위치는 0 이상이어야 합니다.');
    }
    this._position = position;
  }

  // 팩토리 메서드 - 크리에이터 큐레이션 아이템 생성
  static createForCreator(
    spotId: number,
    creatorId: number,
    position: number = 0,
  ): CurationItem {
    return new CurationItem(
      0, // ID는 저장 시 할당
      spotId,
      CurationItemType.CREATOR,
      creatorId,
      null, // 크리에이터 타입이므로 storyId는 null
      position,
      new Date(),
    );
  }

  // 팩토리 메서드 - 스토리 큐레이션 아이템 생성
  static createForStory(
    spotId: number,
    storyId: number,
    position: number = 0,
  ): CurationItem {
    return new CurationItem(
      0, // ID는 저장 시 할당
      spotId,
      CurationItemType.STORY,
      null, // 스토리 타입이므로 creatorId는 null
      storyId,
      position,
      new Date(),
    );
  }
}
