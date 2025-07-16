import { and, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { Database } from "../../../shared/database/connection";
import { creators, follows, users } from "../../../shared/database/schema";
import { User, UserEntity } from "../domain/user.entity";
import type {
  CreateCreatorParams,
  CreateUserParams,
  IUserRepository,
  UpdateCreatorParams,
  UpdateUserParams,
} from "../domain/user.types";

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject(TYPES.Database) private readonly db: Database) {}
  mapToEntity(user: User): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.username,
      user.displayName,
      user.profileImage,
      user.bio,
      user.role,
      user.createdAt,
      user.updatedAt,
      user.creator
        ? {
            id: user.creator.id,
            createdAt: user.creator.createdAt,
            updatedAt: user.creator.updatedAt,
            userId: user.creator.userId,
            brandName: user.creator.brandName,
            region: user.creator.region,
            address: user.creator.address,
            category: user.creator.category,
            socialLinks: user.creator.socialLinks,
            description: user.creator.description,
          }
        : null,
    );
  }
  async findById(id: number): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .leftJoin(creators, eq(users.id, creators.userId))
      .where(eq(users.id, id))
      .limit(1);

    if (!result[0]) return null;
    return this.mapToEntity({
      ...result[0].users,
      creator: result[0].creators,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .leftJoin(creators, eq(users.id, creators.userId))
      .where(eq(users.email, email))
      .limit(1);

    if (!result[0]) return null;

    return this.mapToEntity({
      ...result[0].users,
      creator: result[0].creators,
    });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .leftJoin(creators, eq(users.id, creators.userId))
      .where(eq(users.username, username))
      .limit(1);

    if (!result[0]) return null;

    return this.mapToEntity({
      ...result[0].users,
      creator: result[0].creators,
    });
  }

  async create(userData: CreateUserParams): Promise<UserEntity> {
    const newUserData = UserEntity.create(userData);
    const result = await this.db.insert(users).values(newUserData).returning();

    const createdUser = result[0];
    return new UserEntity(
      createdUser.id,
      createdUser.email,
      createdUser.username,
      createdUser.displayName,
      createdUser.profileImage,
      createdUser.bio,
      createdUser.role,
      createdUser.createdAt,
      createdUser.updatedAt,
      null,
    );
  }

  async update(id: number, userData: UpdateUserParams): Promise<void> {
    await this.db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
    return;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async becomeCreator(
    userId: number,
    creatorData: CreateCreatorParams,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ role: "creator", updatedAt: new Date() })
        .where(eq(users.id, userId));

      await tx.insert(creators).values({
        userId,
        brandName: creatorData.brandName,
        region: creatorData.region,
        address: creatorData.address || null,
        category: creatorData.category,
        socialLinks: creatorData.socialLinks || null,
        description: creatorData.description || "",
      });
    });

    return;
  }

  async updateCreator(
    userId: number,
    creatorData: UpdateCreatorParams,
  ): Promise<void> {
    await this.db
      .update(creators)
      .set({
        ...creatorData,
        updatedAt: new Date(),
      })
      .where(eq(creators.userId, userId));

    return;
  }

  async followUser(userId: number, followerId: number): Promise<void> {
    await this.db.insert(follows).values({
      followerId,
      followingId: userId,
    });
  }

  async unfollowUser(userId: number, followerId: number): Promise<void> {
    await this.db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, userId),
        ),
      );
  }
}
