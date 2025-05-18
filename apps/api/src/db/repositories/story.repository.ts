import { stories, storiesStatusEnum } from "@/db/schema";
import { type DbClient, StoryInsert, StorySelect } from "@/db/types";
import { DatabaseError } from "@/errors/database-error";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class StoryRepository {
  constructor(
    @inject("db")
    private db: DbClient,
  ) {}

  async createStory(data: StoryInsert): Promise<StorySelect> {
    const [story] = await this.db.insert(stories).values(data).returning();
    if (!story)
      throw new DatabaseError(
        "스토리 생성에 실패했습니다.",
        status.INTERNAL_SERVER_ERROR,
      );
    return story;
  }

  async getStoryById(id: number): Promise<StorySelect | undefined> {
    return this.db.query.stories.findFirst({
      where: eq(stories.id, id),
    });
  }

  async getStories({
    status,
    authorId,
    limit = 20,
    offset = 0,
  }: {
    status?: (typeof storiesStatusEnum.enumValues)[number];
    authorId?: number;
    limit?: number;
    offset?: number;
  }): Promise<StorySelect[]> {
    return this.db.query.stories.findMany({
      where:
        status || authorId
          ? and(
              status ? eq(stories.status, status) : undefined,
              authorId ? eq(stories.authorId, authorId) : undefined,
            )
          : undefined,
      limit,
      offset,
      orderBy: [desc(stories.createdAt)],
    });
  }

  async updateStory(
    id: number,
    data: Partial<StoryInsert>,
  ): Promise<StorySelect> {
    const [story] = await this.db
      .update(stories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    if (!story) throw new Error("스토리 수정에 실패했습니다.");
    return story;
  }

  async softDeleteStory(id: number): Promise<StorySelect> {
    const [story] = await this.db
      .update(stories)
      .set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    if (!story)
      throw new DatabaseError(
        "스토리 삭제에 실패했습니다.",
        status.INTERNAL_SERVER_ERROR,
      );
    return story;
  }

  async getStoriesByAuthor(
    authorId: number,
    { limit = 20, offset = 0 } = {},
  ): Promise<StorySelect[]> {
    return this.getStories({ authorId, limit, offset });
  }

  async getStoriesByStatus(
    status: (typeof storiesStatusEnum.enumValues)[number],
    { limit = 20, offset = 0 } = {},
  ): Promise<StorySelect[]> {
    return this.getStories({ status, limit, offset });
  }

  // 키워드(제목/본문) 검색, 지역/카테고리 필터, 전체 목록 조회
  async searchStories({
    keyword,
    regionId,
    categoryId,
    status = "published",
    limit = 20,
    offset = 0,
  }: {
    keyword?: string;
    regionId?: number;
    categoryId?: number;
    status?: (typeof storiesStatusEnum.enumValues)[number];
    limit?: number;
    offset?: number;
  }): Promise<StorySelect[]> {
    const where = [
      status ? eq(stories.status, status) : undefined,
      regionId ? eq(stories.regionId, regionId) : undefined,
      categoryId ? eq(stories.categoryId, categoryId) : undefined,
      keyword
        ? or(
            ilike(stories.title, `%${keyword}%`),
            ilike(stories.contentText, `%${keyword}%`),
          )
        : undefined,
    ].filter(Boolean);
    return this.db.query.stories.findMany({
      where: where.length > 1 ? and(...where) : where[0],
      limit,
      offset,
      orderBy: [desc(stories.createdAt)],
    });
  }

  // 전체 스토리 목록 (상태별)
  async getAllStories({
    status = "published",
    limit = 20,
    offset = 0,
  }: {
    status?: (typeof storiesStatusEnum.enumValues)[number];
    limit?: number;
    offset?: number;
  } = {}): Promise<StorySelect[]> {
    return this.getStories({ status, limit, offset });
  }

  // 스토리 상세 조회 (id)
  async getStoryDetail(id: number): Promise<StorySelect | undefined> {
    return this.getStoryById(id);
  }
}
