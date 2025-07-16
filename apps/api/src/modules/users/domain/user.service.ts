import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { PublicUserProfileDto, UserDto, UserWithStatsDto } from "./user.dto";
import {
  AlreadyCreatorError,
  AlreadyFollowingError,
  InvalidUserDataError,
  UnauthorizedUserActionError,
  UserAlreadyExistsError,
  UserNotCreatorError,
  UserNotFoundError,
} from "./user.errors";
import {
  CreateCreatorParams,
  CreateUserParams,
  IUserRepository,
  UpdateCreatorParams,
  UpdateUserParams,
} from "./user.types";

export interface IUserService {
  getUserById(id: number): Promise<UserDto>;
  getUserPublic(id: number): Promise<PublicUserProfileDto>;
  createUser(userData: CreateUserParams): Promise<UserDto>;
  updateUser(
    id: number,
    userData: UpdateUserParams,
    currentUserId: number,
  ): Promise<void>;
  becomeCreator(
    userId: number,
    creatorData: CreateCreatorParams,
    currentUserId: number,
  ): Promise<void>;
  updateCreator(
    userId: number,
    creatorData: UpdateCreatorParams,
    currentUserId: number,
  ): Promise<void>;
  deleteUser(id: number, currentUserId: number): Promise<void>;
  followUser(userId: number, followerId: number): Promise<void>;
  unfollowUser(userId: number, followerId: number): Promise<void>;
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}
  async followUser(userId: number, followerId: number): Promise<void> {
    if (userId === followerId) {
      throw new AlreadyFollowingError();
    }
    await this.userRepository.followUser(userId, followerId);
  }
  unfollowUser(userId: number, followerId: number): Promise<void> {
    if (userId === followerId) {
      throw new AlreadyFollowingError();
    }
    return this.userRepository.unfollowUser(userId, followerId);
  }
  async updateCreator(
    userId: number,
    creatorData: UpdateCreatorParams,
    currentUserId: number,
  ): Promise<void> {
    // 권한 확인
    if (userId !== currentUserId) {
      throw new UnauthorizedUserActionError("update creator profile");
    }

    const user = await this.userRepository.findById(userId);

    // 크리에이터인지 확인
    if (!user?.isCreator()) {
      throw new UserNotCreatorError();
    }

    // 변경사항이 있는 경우만 유효성 검사
    if (Object.keys(creatorData).length > 0) {
      this.validateCreatorData(creatorData);
    }

    await this.userRepository.updateCreator(userId, creatorData);
    return;
  }

  async deleteUser(id: number, currentUserId: number): Promise<void> {
    // 권한 확인
    if (id !== currentUserId) {
      throw new UnauthorizedUserActionError("delete user account");
    }

    const user = await this.getUserById(id);
    await this.userRepository.delete(user.id);
  }
  private async checkDuplicateUser(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new UserAlreadyExistsError();
    }

    const existingUserByUsername =
      await this.userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new UserAlreadyExistsError();
    }
  }
  private validateUsername(username: string): void {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      throw new InvalidUserDataError(
        "Username can only contain letters, numbers, underscores, and hyphens",
      );
    }

    if (username.length < 3 || username.length > 20) {
      throw new InvalidUserDataError(
        "Username must be between 3 and 20 characters",
      );
    }
  }
  private validateCreatorData(
    creatorData: CreateCreatorParams | UpdateCreatorParams,
  ): void {
    // 브랜드명 검사
    if (creatorData.brandName !== undefined) {
      if (!creatorData.brandName || creatorData.brandName.trim().length === 0) {
        throw new InvalidUserDataError("Brand name is required");
      }
      if (creatorData.brandName.length > 50) {
        throw new InvalidUserDataError(
          "Brand name must be less than 50 characters",
        );
      }
    }

    // 지역 검사
    if (creatorData.region !== undefined) {
      if (!creatorData.region || creatorData.region.trim().length === 0) {
        throw new InvalidUserDataError("Region is required");
      }
    }

    // 카테고리 검사
    if (creatorData.category !== undefined) {
      const validCategories = [
        "art",
        "craft",
        "music",
        "photo",
        "writing",
        "design",
        "tech",
        "cooking",
        "other",
      ];
      if (!validCategories.includes(creatorData.category)) {
        throw new InvalidUserDataError(`"Invalid category ${validCategories}`);
      }
    }

    // 소셜 링크 URL 형식 검사
    if (creatorData.socialLinks) {
      const urlRegex = /^https?:\/\/.+/;
      for (const [platform, url] of Object.entries(creatorData.socialLinks)) {
        if (url && !urlRegex.test(url)) {
          throw new InvalidUserDataError(`Invalid URL format for ${platform}`);
        }
      }
    }

    // 설명 길이 검사
    if (creatorData.description !== undefined && creatorData.description) {
      if (creatorData.description.length > 500) {
        throw new InvalidUserDataError(
          "Description must be less than 500 characters",
        );
      }
    }
  }

  async getUserById(id: number): Promise<UserWithStatsDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      creator: user.creator,
      stats: {
        followingCount: 0,
        followersCount: 0,
        projectsCount: 0,
        storiesCount: 0,
      },
    };
  }

  async getUserPublic(id: number): Promise<PublicUserProfileDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }

    const stats = {
      followersCount: 0,
      followingCount: 0,
      projectsCount: 0,
      storiesCount: 0,
    };

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      creator: user.creator,
      stats,
    };
  }

  async createUser(userData: CreateUserParams): Promise<UserDto> {
    await this.checkDuplicateUser(userData.email, userData.username);

    this.validateUsername(userData.username);

    return await this.userRepository.create(userData);
  }

  async updateUser(
    id: number,
    userData: UpdateUserParams,
    currentUserId: number,
  ): Promise<void> {
    if (id !== currentUserId) {
      throw new UnauthorizedUserActionError();
    }

    const existingUser = await this.getUserById(id);

    if (userData.username && userData.username !== existingUser.username) {
      this.validateUsername(userData.username);
      const userWithSameUsername = await this.userRepository.findByUsername(
        userData.username,
      );
      if (userWithSameUsername) {
        throw new UserAlreadyExistsError();
      }
    }

    return await this.userRepository.update(id, userData);
  }

  async becomeCreator(
    userId: number,
    creatorData: CreateCreatorParams,
    currentUserId: number,
  ): Promise<void> {
    // 권한 확인
    if (userId !== currentUserId) {
      throw new UnauthorizedUserActionError("become creator");
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // 이미 크리에이터인지 확인
    if (user.isCreator()) {
      throw new AlreadyCreatorError();
    }

    // 크리에이터 데이터 유효성 검사
    this.validateCreatorData(creatorData);

    return await this.userRepository.becomeCreator(userId, creatorData);
  }
}
