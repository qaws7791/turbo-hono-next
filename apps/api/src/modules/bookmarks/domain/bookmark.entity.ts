export type BookmarkTargetType = "story" | "project";

export interface Bookmark {
  id: number;
  userId: number;
  targetId: number;
  targetType: BookmarkTargetType;
  createdAt: Date;
}

export class BookmarkEntity implements Bookmark {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly targetId: number,
    public readonly targetType: BookmarkTargetType,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    userId: number;
    targetId: number;
    targetType: BookmarkTargetType;
  }): Omit<Bookmark, "id" | "createdAt"> {
    return {
      userId: data.userId,
      targetId: data.targetId,
      targetType: data.targetType,
    };
  }

  isStoryBookmark(): boolean {
    return this.targetType === "story";
  }

  isProjectBookmark(): boolean {
    return this.targetType === "project";
  }

  belongsToUser(userId: number): boolean {
    return this.userId === userId;
  }
}