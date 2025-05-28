/**
 * 이메일 인증 토큰 엔티티
 * 사용자 이메일 인증을 위한 토큰 정보를 나타냅니다.
 */
export class EmailVerificationToken {
  constructor(
    private readonly _id: number,
    private readonly _userId: number,
    private readonly _token: string,
    private readonly _expiresAt: Date,
    private readonly _createdAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // 도메인 로직
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  // 팩토리 메서드
  static create(userId: number, token: string, expiresInHours = 24): EmailVerificationToken {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    return new EmailVerificationToken(
      0, // ID는 저장 시 할당
      userId,
      token,
      expiresAt,
      now,
    );
  }
}
