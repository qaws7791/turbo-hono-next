import { ReactionType } from './story.types';

/**
 * 반응 엔티티
 * 사용자가 스토리에 남긴 반응(이모지)을 나타냅니다.
 */
export class Reaction {
  constructor(
    private readonly _id: number,
    private readonly _storyId: number,
    private readonly _userId: number,
    private _reactionType: ReactionType,
    private readonly _createdAt: Date,
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get storyId(): number {
    return this._storyId;
  }

  get userId(): number {
    return this._userId;
  }

  get reactionType(): ReactionType {
    return this._reactionType;
  }

  get createdAt(): Date {
    return this._createdAt;
  }


  // Setters with validation
  updateReactionType(type: ReactionType): void {
    this._reactionType = type;
  }

  // 팩토리 메서드
  static create(
    storyId: number,
    userId: number,
    reactionType: ReactionType,
  ): Reaction {
    const now = new Date();
    
    return new Reaction(
      0, // ID는 저장 시 할당
      storyId,
      userId,
      reactionType,
      now,
    );
  }
}
