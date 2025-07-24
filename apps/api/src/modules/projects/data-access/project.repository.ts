import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { Database } from "../../../shared/database/connection";
import {
  bookmarks,
  categories,
  creators,
  projects,
  stories,
  users,
} from "../../../shared/database/schema";
import { ProjectListResponseDto } from "../domain/project.dto";
import { Project } from "../domain/project.entity";
import {
  CreateProjectData,
  ProjectListParams,
  UpdateProjectData,
} from "../domain/project.types";

interface IProjectRepository {
  create(creatorId: number, data: CreateProjectData): Promise<Project>;
  findById(id: number): Promise<Project | null>;
  findMany(
    params: ProjectListParams,
    viewerId?: number,
  ): Promise<ProjectListResponseDto>;
  findByCreatorAndTitle(
    creatorId: number,
    title: string,
  ): Promise<Project | null>;
  update(id: number, data: UpdateProjectData): Promise<Project>;
  delete(id: number): Promise<void>;
  incrementViewCount(id: number): Promise<void>;
  updateStoryCount(projectId: number): Promise<void>;
  categoryExists(categoryId: number): Promise<boolean>;
}

@injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(@inject(TYPES.Database) private db: Database) {}

  async create(creatorId: number, data: CreateProjectData): Promise<Project> {
    const [result] = await this.db
      .insert(projects)
      .values({
        creatorId,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage || null,
        status: data.status || "draft",
        categoryId: data.categoryId,
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();

    return new Project(
      result.id,
      result.creatorId,
      result.title,
      result.description,
      result.coverImage,
      result.status,
      result.categoryId,
      result.viewCount,
      result.storyCount,
      result.bookmarkCount,
      result.publishedAt,
      result.createdAt,
      result.updatedAt,
    );
  }

  async findById(id: number): Promise<Project | null> {
    const [result] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!result) return null;

    return new Project(
      result.id,
      result.creatorId,
      result.title,
      result.description,
      result.coverImage,
      result.status,
      result.categoryId,
      result.viewCount,
      result.storyCount,
      result.bookmarkCount,
      result.publishedAt,
      result.createdAt,
      result.updatedAt,
    );
  }

  async findMany(
    params: ProjectListParams,
    viewerId?: number,
  ): Promise<ProjectListResponseDto> {
    const { cursor, limit, filters } = params;

    // Build the base query
    const baseSelect = {
      id: projects.id,
      creatorId: projects.creatorId,
      title: projects.title,
      description: projects.description,
      coverImage: projects.coverImage,
      status: projects.status,
      categoryId: projects.categoryId,
      viewCount: projects.viewCount,
      storyCount: projects.storyCount,
      bookmarkCount: projects.bookmarkCount,
      publishedAt: projects.publishedAt,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,

      // Creator fields flattened
      creatorUserId: users.id,
      creatorEmail: users.email,
      creatorUsername: users.username,
      creatorDisplayName: users.displayName,
      creatorProfileImage: users.profileImage,
      creatorBio: users.bio,
      creatorRole: users.role,
      creatorCreatedAt: users.createdAt,
      creatorUpdatedAt: users.updatedAt,
      creatorBrandName: creators.brandName,
      creatorRegion: creators.region,
      creatorCategory: creators.category,
      creatorSocialLinks: creators.socialLinks,
      creatorDescription: creators.description,

      // Category fields flattened
      categoryInfoId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,

      isBookmarked: viewerId
        ? sql<boolean>`CASE WHEN ${bookmarks.id} IS NOT NULL THEN true ELSE false END`
        : sql<boolean>`false`,
    } as const;

    // Build filters conditions
    const conditions = [];

    if (filters.status && filters.status !== "all") {
      conditions.push(eq(projects.status, filters.status));
    }

    if (filters.creatorId) {
      conditions.push(eq(projects.creatorId, filters.creatorId));
    }

    if (filters.region) {
      conditions.push(eq(creators.region, filters.region));
    }

    if (filters.category) {
      conditions.push(eq(categories.slug, filters.category));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(projects.title, `%${filters.search}%`),
          like(projects.description, `%${filters.search}%`),
        ),
      );
    }

    // Cursor 조건 추가
    if (cursor) {
      const { timestamp, id } = this.decodeCursor(cursor);

      if (filters.sort === "popular") {
        conditions.push(
          or(
            sql`${projects.viewCount} < ${timestamp}`,
            and(
              sql`${projects.viewCount} = ${timestamp}`,
              sql`${projects.publishedAt} < '${id}'`,
            ),
          ),
        );
      } else {
        conditions.push(
          or(
            sql`${projects.publishedAt} < '${timestamp}'`,
            and(
              sql`${projects.publishedAt} IS NULL`,
              sql`${projects.createdAt} < '${timestamp}'`,
            ),
            and(
              sql`${projects.publishedAt} = '${timestamp}'`,
              sql`${projects.id} < ${id}`,
            ),
          ),
        );
      }
    }

    // Build and execute the query in a type-safe way
    let queryBuilder = this.db
      .select(baseSelect)
      .from(projects)
      .leftJoin(users, eq(projects.creatorId, users.id))
      .leftJoin(creators, eq(users.id, creators.userId))
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .$dynamic();

    if (viewerId) {
      queryBuilder = queryBuilder.leftJoin(
        bookmarks,
        and(
          eq(bookmarks.targetId, projects.id),
          eq(bookmarks.targetType, "project"),
          eq(bookmarks.userId, viewerId),
        ),
      );
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }

    // Apply sorting
    if (filters.sort === "popular") {
      queryBuilder = queryBuilder.orderBy(
        desc(projects.viewCount),
        desc(projects.publishedAt),
        desc(projects.id),
      );
    } else {
      queryBuilder = queryBuilder.orderBy(
        desc(sql`COALESCE(${projects.publishedAt}, ${projects.createdAt})`),
        desc(projects.id),
      );
    }

    // Execute with limit
    const results = await queryBuilder.limit(limit + 1);

    const hasNext = results.length > limit;
    const items = hasNext ? results.slice(0, limit) : results;

    // 다음 커서 생성
    let nextCursor: string | null = null;
    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (filters.sort === "popular") {
        nextCursor = this.encodeCursor(
          lastItem.viewCount.toString(),
          lastItem.publishedAt?.toISOString() || "",
        );
      } else {
        const timestamp = lastItem.publishedAt || lastItem.createdAt;
        nextCursor = this.encodeCursor(
          timestamp.toISOString(),
          lastItem.id.toString(),
        );
      }
    }

    return {
      data: items,
      pagination: {
        nextCursor,
        hasNext,
        limit,
      },
    };
  }

  private encodeCursor(timestamp: string, id: string): string {
    return Buffer.from(`${timestamp}:${id}`).toString("base64");
  }

  private decodeCursor(cursor: string): { timestamp: string; id: string } {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const [timestamp, id] = decoded.split(":");
    return { timestamp, id };
  }

  async findByCreatorAndTitle(
    creatorId: number,
    title: string,
  ): Promise<Project | null> {
    const [result] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.creatorId, creatorId), eq(projects.title, title)))
      .limit(1);

    if (!result) return null;

    return new Project(
      result.id,
      result.creatorId,
      result.title,
      result.description,
      result.coverImage,
      result.status,
      result.categoryId,
      result.viewCount,
      result.storyCount,
      result.bookmarkCount,
      result.publishedAt,
      result.createdAt,
      result.updatedAt,
    );
  }

  async update(id: number, data: UpdateProjectData): Promise<Project> {
    const updateData: any = { ...data, updatedAt: new Date() };

    if (data.status === "published") {
      updateData.publishedAt = new Date();
    }

    const [result] = await this.db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    return new Project(
      result.id,
      result.creatorId,
      result.title,
      result.description,
      result.coverImage,
      result.status,
      result.categoryId,
      result.viewCount,
      result.storyCount,
      result.bookmarkCount,
      result.publishedAt,
      result.createdAt,
      result.updatedAt,
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.db
      .update(projects)
      .set({
        viewCount: sql`${projects.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));
  }

  async updateStoryCount(projectId: number): Promise<void> {
    const [{ count: storyCount }] = await this.db
      .select({ count: count() })
      .from(stories)
      .where(
        and(eq(stories.projectId, projectId), eq(stories.status, "published")),
      );

    await this.db
      .update(projects)
      .set({
        storyCount,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  }

  async categoryExists(categoryId: number): Promise<boolean> {
    const [result] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    return !!result;
  }
}
