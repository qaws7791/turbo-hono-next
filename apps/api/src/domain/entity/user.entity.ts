import { UserRole, UserStatus } from './user.types';

/**
 * 사용자 엔티티
 * 플랫폼 사용자의 기본 정보를 나타냅니다.
 */
export class User {
  constructor(
    private readonly _id: number,
    private _name: string,
    private _email: string | null,
    private _emailVerified: Date | null,
    private _profileImageUrl: string | null,
    private _role: UserRole,
    private _status: UserStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string | null {
    return this._email;
  }

  get emailVerified(): Date | null {
    return this._emailVerified;
  }

  get profileImageUrl(): string | null {
    return this._profileImageUrl;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
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
      throw new Error('이름은 비어있을 수 없습니다.');
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  updateEmail(email: string | null): void {
    if (email !== null) {
      // 간단한 이메일 유효성 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('유효하지 않은 이메일 형식입니다.');
      }
    }
    this._email = email;
    this._emailVerified = null; // 이메일 변경 시 인증 상태 초기화
    this._updatedAt = new Date();
  }

  verifyEmail(): void {
    if (!this._email) {
      throw new Error('이메일이 설정되지 않았습니다.');
    }
    this._emailVerified = new Date();
    this._updatedAt = new Date();
  }

  updateProfileImage(url: string | null): void {
    this._profileImageUrl = url;
    this._updatedAt = new Date();
  }

  promoteToCreator(): void {
    if (this._role === UserRole.CREATOR) {
      throw new Error('이미 크리에이터 역할을 가지고 있습니다.');
    }
    this._role = UserRole.CREATOR;
    this._updatedAt = new Date();
  }

  updateStatus(status: UserStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  // 도메인 로직
  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  isCreator(): boolean {
    return this._role === UserRole.CREATOR;
  }

  canCreateStory(): boolean {
    return this.isActive() && this.isCreator();
  }

  // 팩토리 메서드
  static create(
    name: string,
    email: string | null,
    profileImageUrl: string | null = null,
  ): User {
    const now = new Date();
    return new User(
      0, // ID는 저장 시 할당
      name,
      email,
      null, // 이메일 인증 전
      profileImageUrl,
      UserRole.USER, // 기본 역할
      UserStatus.ACTIVE, // 기본 상태
      now,
      now,
    );
  }
}
