import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { Database } from "../../../shared/database/connection";
import { bookmarks } from "../../../shared/database/schema";
import {
  Bookmark,
  BookmarkEntity,
  BookmarkTargetType,
} from "../domain/bookmark.entity";
import type {
  CreateBookmarkParams,
  IBookmarkRepository,
} from "../domain/bookmark.types";

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
  constructor(@inject(TYPES.Database) private readonly db: Database) {}

  private mapToEntity(bookmark: Bookmark): BookmarkEntity {
    return new BookmarkEntity(
      bookmark.id,
      bookmark.userId,
      bookmark.targetId,
      bookmark.targetType,
      bookmark.createdAt,
    );
  }

  async findById(id: number): Promise<BookmarkEntity | null> {
    const result = await this.db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, id))
      .limit(1);

    if (!result[0]) return null;
    return this.mapToEntity(result[0]);
  }

  async findByUserAndTarget(
    userId: number,
    targetId: number,
    targetType: BookmarkTargetType,
  ): Promise<BookmarkEntity | null> {
    const result = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.targetId, targetId),
          eq(bookmarks.targetType, targetType),
        ),
      )
      .limit(1);

    if (!result[0]) return null;
    return this.mapToEntity(result[0]);
  }

  async findByUserId(userId: number): Promise<BookmarkEntity[]> {
    const result = await this.db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(bookmarks.createdAt);

    return result.map((bookmark) => this.mapToEntity(bookmark));
  }

  async findByUserIdAndType(
    userId: number,
    targetType: BookmarkTargetType,
  ): Promise<BookmarkEntity[]> {
    const result = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.targetType, targetType),
        ),
      )
      .orderBy(bookmarks.createdAt);

    return result.map((bookmark) => this.mapToEntity(bookmark));
  }

  async create(params: CreateBookmarkParams): Promise<BookmarkEntity> {
    const newBookmarkData = BookmarkEntity.create(params);
    const result = await this.db
      .insert(bookmarks)
      .values(newBookmarkData)
      .returning();

    const createdBookmark = result[0];
    return this.mapToEntity(createdBookmark);
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(bookmarks).where(eq(bookmarks.id, id));
  }

  async deleteByUserAndTarget(
    userId: number,
    targetId: number,
    targetType: BookmarkTargetType,
  ): Promise<void> {
    await this.db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.targetId, targetId),
          eq(bookmarks.targetType, targetType),
        ),
      );
  }

  async isBookmarked(
    userId: number,
    targetId: number,
    targetType: BookmarkTargetType,
  ): Promise<boolean> {
    const result = await this.db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.targetId, targetId),
          eq(bookmarks.targetType, targetType),
        ),
      )
      .limit(1);

    return result.length > 0;
  }
}
