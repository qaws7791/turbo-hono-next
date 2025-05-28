import { SocialProvider } from './user.types';

/**
 * 계정 엔티티
 * 사용자의 소셜 로그인 계정 정보를 나타냅니다.
 */
export class Account {
  constructor(
    private readonly _id: number,
    private readonly _userId: number,
    private readonly _providerId: SocialProvider,
    private readonly _providerAccountId: string,
    private _password: string | null,
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

  get providerId(): SocialProvider {
    return this._providerId;
  }

  get providerAccountId(): string {
    return this._providerAccountId;
  }

  get password(): string | null {
    return this._password;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // 비밀번호 업데이트 (이메일 계정인 경우)
  updatePassword(hashedPassword: string): void {
    if (this._providerId !== SocialProvider.EMAIL) {
      throw new Error('이메일 계정만 비밀번호를 업데이트할 수 있습니다.');
    }
    this._password = hashedPassword;
    this._updatedAt = new Date();
  }

  // 도메인 로직
  isEmailAccount(): boolean {
    return this._providerId === SocialProvider.EMAIL;
  }

  isSocialAccount(): boolean {
    return this._providerId !== SocialProvider.EMAIL;
  }

  // 팩토리 메서드
  static createSocialAccount(
    userId: number,
    provider: SocialProvider,
    providerAccountId: string,
  ): Account {
    if (provider === SocialProvider.EMAIL) {
      throw new Error('소셜 계정 생성에 EMAIL 제공자를 사용할 수 없습니다.');
    }
    
    const now = new Date();
    return new Account(
      0, // ID는 저장 시 할당
      userId,
      provider,
      providerAccountId,
      null, // 소셜 계정은 비밀번호 없음
      now,
      now,
    );
  }

  static createEmailAccount(
    userId: number,
    email: string,
    hashedPassword: string,
  ): Account {
    const now = new Date();
    return new Account(
      0, // ID는 저장 시 할당
      userId,
      SocialProvider.EMAIL,
      email, // 이메일 계정은 이메일을 providerAccountId로 사용
      hashedPassword,
      now,
      now,
    );
  }
}
