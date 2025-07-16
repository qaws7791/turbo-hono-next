import { User, UserEntity } from "./user.entity";

export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  create(userData: CreateUserParams): Promise<UserEntity>;
  update(id: number, userData: UpdateUserParams): Promise<void>;
  delete(id: number): Promise<void>;
  becomeCreator(
    userId: number,
    creatorData: CreateCreatorParams,
  ): Promise<void>;
  updateCreator(
    userId: number,
    creatorData: UpdateCreatorParams,
  ): Promise<void>;
  followUser(userId: number, followerId: number): Promise<void>;
  unfollowUser(userId: number, followerId: number): Promise<void>;
  mapToEntity(user: User): UserEntity;
}

export interface CreateUserParams {
  email: string;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
}

export interface UpdateUserParams {
  username?: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
}

export interface CreateCreatorParams {
  brandName: string;
  region: string;
  address?: string | null;
  category:
    | "art"
    | "craft"
    | "music"
    | "photo"
    | "writing"
    | "design"
    | "tech"
    | "cooking"
    | "other";
  socialLinks?: Record<string, string> | null;
  description?: string;
}

export interface UpdateCreatorParams {
  brandName?: string;
  region?: string;
  address?: string;
  category?:
    | "art"
    | "craft"
    | "music"
    | "photo"
    | "writing"
    | "design"
    | "tech"
    | "cooking"
    | "other";
  socialLinks?: Record<string, string>;
  description?: string;
}

export interface UserStats {
  followingCount?: number;
  followersCount: number;
  projectsCount: number;
  storiesCount: number;
}

export interface PublicUserProfile extends Omit<User, "email"> {
  stats: Omit<UserStats, "followingCount">;
  isFollowing?: boolean;
}
