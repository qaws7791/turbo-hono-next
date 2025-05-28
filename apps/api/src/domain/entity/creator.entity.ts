import { CreatorStatus } from './creator.types';

/**
 * 크리에이터 엔티티
 * 플랫폼 내 크리에이터 역할을 가진 사용자의 추가 정보를 나타냅니다.
 */
export class Creator {
  constructor(
    private readonly _id: number,
    private readonly _userId: number,
    private _brandName: string,
    private _bio: string | null,
    private _profileImageUrl: string | null,
    private _coverImageUrl: string | null,
    private _sidoId: number | null,
    private _sigunguId: number | null,
    private _categoryId: number | null,
    private _status: CreatorStatus,
    private _approvedAt: Date | null,
    private _rejectedAt: Date | null,
    private _rejectionReason: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get brandName(): string {
    return this._brandName;
  }

  get bio(): string | null {
    return this._bio;
  }

  get profileImageUrl(): string | null {
    return this._profileImageUrl;
  }

  get coverImageUrl(): string | null {
    return this._coverImageUrl;
  }

  get sidoId(): number | null {
    return this._sidoId;
  }

  get sigunguId(): number | null {
    return this._sigunguId;
  }

  get categoryId(): number | null {
    return this._categoryId;
  }

  get status(): CreatorStatus {
    return this._status;
  }

  get approvedAt(): Date | null {
    return this._approvedAt;
  }

  get rejectedAt(): Date | null {
    return this._rejectedAt;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setters with validation
  updateBrandName(brandName: string): void {
    if (!brandName || brandName.trim().length === 0) {
      throw new Error('브랜드 이름은 비어있을 수 없습니다.');
    }
    this._brandName = brandName;
    this._updatedAt = new Date();
  }

  updateBio(bio: string | null): void {
    this._bio = bio;
    this._updatedAt = new Date();
  }

  updateProfileImage(url: string | null): void {
    this._profileImageUrl = url;
    this._updatedAt = new Date();
  }

  updateCoverImage(url: string | null): void {
    this._coverImageUrl = url;
    this._updatedAt = new Date();
  }

  updateLocation(sidoId: number | null, sigunguId: number | null): void {
    // 시군구가 있으면 시도도 있어야 함
    if (sigunguId !== null && sidoId === null) {
      throw new Error('시군구를 설정하려면 시도도 설정해야 합니다.');
    }
    
    this._sidoId = sidoId;
    this._sigunguId = sigunguId;
    this._updatedAt = new Date();
  }

  updateCategory(categoryId: number | null): void {
    this._categoryId = categoryId;
    this._updatedAt = new Date();
  }

  // 상태 변경 메서드
  approve(): void {
    if (this._status !== CreatorStatus.PENDING) {
      throw new Error('대기 중인 크리에이터만 승인할 수 있습니다.');
    }
    
    this._status = CreatorStatus.APPROVED;
    this._approvedAt = new Date();
    this._rejectedAt = null;
    this._rejectionReason = null;
    this._updatedAt = new Date();
  }

  reject(reason: string): void {
    if (this._status !== CreatorStatus.PENDING) {
      throw new Error('대기 중인 크리에이터만 거부할 수 있습니다.');
    }
    
    this._status = CreatorStatus.REJECTED;
    this._rejectedAt = new Date();
    this._rejectionReason = reason;
    this._updatedAt = new Date();
  }

  activate(): void {
    if (this._status !== CreatorStatus.APPROVED && this._status !== CreatorStatus.INACTIVE) {
      throw new Error('승인된 또는 비활성화된 크리에이터만 활성화할 수 있습니다.');
    }
    
    this._status = CreatorStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this._status !== CreatorStatus.ACTIVE) {
      throw new Error('활성화된 크리에이터만 비활성화할 수 있습니다.');
    }
    
    this._status = CreatorStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  suspend(): void {
    this._status = CreatorStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  // 도메인 로직
  isPending(): boolean {
    return this._status === CreatorStatus.PENDING;
  }

  isApproved(): boolean {
    return this._status === CreatorStatus.APPROVED;
  }

  isRejected(): boolean {
    return this._status === CreatorStatus.REJECTED;
  }

  isActive(): boolean {
    return this._status === CreatorStatus.ACTIVE;
  }

  canCreateStory(): boolean {
    return this.isActive();
  }

  // 팩토리 메서드
  static apply(
    userId: number,
    brandName: string,
    bio: string | null = null,
    profileImageUrl: string | null = null,
    coverImageUrl: string | null = null,
    sidoId: number | null = null,
    sigunguId: number | null = null,
    categoryId: number | null = null,
  ): Creator {
    const now = new Date();
    
    return new Creator(
      0, // ID는 저장 시 할당
      userId,
      brandName,
      bio,
      profileImageUrl,
      coverImageUrl,
      sidoId,
      sigunguId,
      categoryId,
      CreatorStatus.PENDING, // 신청 시 기본 상태
      null, // 승인 전
      null, // 거부 전
      null, // 거부 이유 없음
      now,
      now,
    );
  }
}
