import type { BookmarkEntity, BookmarkTargetType } from "./bookmark.entity";

export interface IBookmarkRepository {
  findById(id: number): Promise<BookmarkEntity | null>;
  findByUserAndTarget(
    userId: number,
    targetId: number,
    targetType: BookmarkTargetType,
  ): Promise<BookmarkEntity | null>;
  findByUserId(userId: number): Promise<BookmarkEntity[]>;
  findByUserIdAndType(
    userId: number,
    targetType: BookmarkTargetType,
  ): Promise<BookmarkEntity[]>;
  create(params: CreateBookmarkParams): Promise<BookmarkEntity>;
  delete(id: number): Promise<void>;
  deleteByUserAndTarget(
    userId: number,
    targetId: number,
    targetType: BookmarkTargetType,
  ): Promise<void>;
  isBookmarked(
    userId: number,
    targetId: number,
    targetType: BookmarkTargetType,
  ): Promise<boolean>;
}

export interface CreateBookmarkParams {
  userId: number;
  targetId: number;
  targetType: BookmarkTargetType;
}