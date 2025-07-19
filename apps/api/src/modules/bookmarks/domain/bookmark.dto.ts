import type { BookmarkTargetType } from "./bookmark.entity";

export interface BookmarkDto {
  readonly id: number;
  readonly userId: number;
  readonly targetId: number;
  readonly targetType: BookmarkTargetType;
  readonly createdAt: Date;
}

export interface BookmarkWithTargetDto extends BookmarkDto {
  readonly target: BookmarkTargetDto | null;
}

export interface BookmarkTargetDto {
  readonly id: number;
  readonly title: string;
  readonly createdAt: Date;
  readonly creator?: {
    readonly id: number;
    readonly username: string;
    readonly displayName: string;
    readonly profileImage: string;
  };
}

export interface BookmarkListDto {
  readonly bookmarks: BookmarkWithTargetDto[];
  readonly totalCount: number;
}