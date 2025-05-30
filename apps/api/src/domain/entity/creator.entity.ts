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
    private _introduction: string,
    private _businessNumber: string,
    private _businessName: string,
    private _ownerName: string,
    private _contactInfo: string,
    private _sidoId: number,
    private _sigunguId: number,
    private _categoryId: number,
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

  get sidoId(): number {
    return this._sidoId;
  }

  get sigunguId(): number {
    return this._sigunguId;
  }

  get categoryId(): number {
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

  get introduction(): string {
    return this._introduction;
  }

  get businessNumber(): string {
    return this._businessNumber;
  }

  get businessName(): string {
    return this._businessName;
  }

  get ownerName(): string {
    return this._ownerName;
  }

  get contactInfo(): string {
    return this._contactInfo;
  }

  // Setters with validation
  updateBrandName(brandName: string): void {
    if (!brandName || brandName.trim().length === 0) {
      throw new Error('브랜드 이름은 비어있을 수 없습니다.');
    }
    this._brandName = brandName;
    this._updatedAt = new Date();
  }

  updateIntroduction(introduction: string): void {
    this._introduction = introduction;
    this._updatedAt = new Date();
  }

  updateBusinessNumber(businessNumber: string): void {
    this._businessNumber = businessNumber;
    this._updatedAt = new Date();
  }

  updateBusinessName(businessName: string): void {
    this._businessName = businessName;
    this._updatedAt = new Date();
  }

  updateOwnerName(ownerName: string): void {
    this._ownerName = ownerName;
    this._updatedAt = new Date();
  }

  updateContactInfo(contactInfo: string): void {
    this._contactInfo = contactInfo;
    this._updatedAt = new Date();
  }
  updateLocation(sidoId: number, sigunguId: number): void {
    this._sidoId = sidoId;
    this._sigunguId = sigunguId;
    this._updatedAt = new Date();
  }

  updateCategory(categoryId: number): void {
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
    introduction: string,
    businessNumber: string,
    businessName: string,
    ownerName: string,
    contactInfo: string,
    sidoId: number,
    sigunguId: number,
    categoryId: number,
  ): Creator {
    const now = new Date();
    
    return new Creator(
      0, // ID는 저장 시 할당
      userId,
      brandName,
      introduction,
      businessNumber,
      businessName,
      ownerName,
      contactInfo,
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
