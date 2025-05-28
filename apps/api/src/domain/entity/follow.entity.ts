/**
 * 팔로우 엔티티
 * 사용자가 크리에이터를 팔로우하는 관계를 나타냅니다.
 */
export class Follow {
  constructor(
    private readonly _id: number,
    private readonly _followerId: number, // 팔로우하는 사용자 ID (users.id)
    private readonly _followingId: number, // 팔로우 받는 크리에이터 ID (creators.id)
    private readonly _createdAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get followerId(): number {
    return this._followerId;
  }

  get followingId(): number {
    return this._followingId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // 팩토리 메서드
  static create(
    followerId: number,
    followingId: number,
  ): Follow {
    const now = new Date();
    
    return new Follow(
      0, // ID는 저장 시 할당
      followerId,
      followingId,
      now,
    );
  }
}
