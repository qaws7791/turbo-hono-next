export type UserRole = "user" | "creator";

export interface UserDto {
  readonly id: number;
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly profileImage: string;
  readonly bio: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly creator: CreatorDto | null;
}

export interface UserWithStatsDto extends UserDto {
  readonly stats: UserStats;
}

export interface CreatorDto {
  readonly brandName: string;
  readonly address: string | null;
  readonly region: string;
  readonly category: string;
  readonly socialLinks: Record<string, string> | null;
  readonly description: string;
}

export interface UserStats {
  followingCount: number;
  followersCount: number;
  projectsCount: number;
  storiesCount: number;
}

export interface PublicUserProfileDto extends Omit<UserDto, "email"> {
  stats: Omit<UserStats, "followingCount">;
  isFollowing?: boolean;
}
