/**
 * 세션 엔티티
 * 사용자 로그인 세션을 나타냅니다.
 */
export class Session {
  constructor(
    private readonly _id: number,
    private readonly _userId: number,
    private readonly _token: string,
    private readonly _expiresAt: Date,
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

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // 도메인 로직
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  // 팩토리 메서드
  static create(userId: number, token: string, expiresInDays = 30): Session {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return new Session(
      0, // ID는 저장 시 할당
      userId,
      token,
      expiresAt,
      now,
      now,
    );
  }
}
