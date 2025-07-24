import { UserDto } from "../../users/domain/user.dto";

export interface ProjectDto {
  readonly id: number;
  readonly creatorId: number;
  readonly title: string;
  readonly description: string;
  readonly coverImage: string | null;
  readonly status: "draft" | "published";
  readonly categoryId: number;
  readonly viewCount: number;
  readonly storyCount: number;
  readonly bookmarkCount: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProjectWithStatsDto extends ProjectDto {
  readonly stats: ProjectStatsDto;
}

export interface ProjectListDto {
  readonly projects: ProjectDto[];
  readonly totalCount: number;
  readonly hasMore: boolean;
}

export interface ProjectListResponseDto {
  readonly data: ProjectDto[];
  readonly pagination: {
    readonly nextCursor: string | null;
    readonly hasNext: boolean;
    readonly limit: number;
  };
}

export interface CategoryDto {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly slug: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProjectStatsDto {
  readonly viewCount: number;
  readonly storyCount: number;
  readonly bookmarkCount: number;
  readonly engagementRate: number;
}

export interface ProjectDetailDto {
  readonly project: ProjectDto;
  readonly creator: UserDto;
  readonly category: CategoryDto;
  readonly isBookmarked: boolean;
}

export interface ProjectSummaryDto {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly coverImage: string | null;
  readonly status: "draft" | "published";
  readonly viewCount: number;
  readonly storyCount: number;
  readonly bookmarkCount: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly creator: {
    readonly id: number;
    readonly displayName: string;
    readonly profileImage: string;
  };
  readonly category: {
    readonly id: number;
    readonly name: string;
    readonly icon: string;
  };
}
