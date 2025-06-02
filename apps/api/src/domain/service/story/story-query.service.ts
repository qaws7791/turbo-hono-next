import { StoryDetailResponseSchema, StorySummaryResponseSchema } from '@/application/dtos/platform/story.dto';
import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { StoryStatus } from '@/domain/entity/story.types';
import { creators, reactions, stories, users } from '@/infrastructure/database/schema';
import { count, desc, eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { PaginationOptions, PaginationResult } from '../service.types';
import { IStoryQueryService } from './story-query.service.interface';

/**
 * 스토리 쿼리 서비스 구현
 * 스토리 조회 관련 기능을 구현합니다.
 */
@injectable()
export class StoryQueryService implements IStoryQueryService {
  constructor(
    @inject(DI_SYMBOLS.db)
    private db: PostgresJsDatabase,

  ) {}
  async getStoryDetailById(id: number): Promise<z.infer<typeof StoryDetailResponseSchema>> {
    const [storyWithAuthor] = await this.db.select({
      id: stories.id,
      title: stories.title,
      coverImageUrl: stories.coverImageUrl,
      authorId: stories.authorId,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      content: stories.content,
      contentText: stories.contentText,
        author: {
          id: creators.id,
          name: users.name,
          profileImageUrl: users.profileImageUrl,
        },
    }).from(stories)
    .innerJoin(creators, eq(stories.authorId, creators.id))
    .innerJoin(users, eq(creators.userId, users.id))
    .where(eq(stories.id, id));

    if (!storyWithAuthor) {
      throw new DatabaseError("스토리가 없습니다.", status.NOT_FOUND);
    }

    const reactionCount = await this.db
    .select({
      storyId: reactions.storyId,
      reactionType: reactions.reactionType,
      count: count(),
    })
    .from(reactions)
    .where(eq(reactions.storyId, id))
    .groupBy(reactions.storyId, reactions.reactionType)

    return {
      id: storyWithAuthor.id,
      title: storyWithAuthor.title,
      coverImageUrl: storyWithAuthor.coverImageUrl,
      authorId: storyWithAuthor.authorId,
      createdAt: storyWithAuthor.createdAt.toISOString(),
      updatedAt: storyWithAuthor.updatedAt.toISOString(),
      content: storyWithAuthor.content as string,
      contentText: storyWithAuthor.contentText,
      author: storyWithAuthor.author,
      reactions: reactionCount,
    }
    
  }
  async listStories(options: PaginationOptions): Promise<PaginationResult<z.infer<typeof StorySummaryResponseSchema>>> {
    const { limit, page = 1 } = options;
    const offset = (page - 1) * limit;
    
    // 전체 스토리 개수 조회
    const [totalCountResult] = await this.db
      .select({ count: count() })
      .from(stories)
      .where(eq(stories.status, StoryStatus.PUBLISHED));
    
    const totalCount = totalCountResult?.count ?? 0;
    
    // 스토리 목록 조회 (작성자 정보 포함)
    const storiesWithAuthors = await this.db
      .select({
        id: stories.id,
        title: stories.title,
        coverImageUrl: stories.coverImageUrl,
        authorId: stories.authorId,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
        // 작성자 정보
        author: {
          id: creators.id,
          name: users.name,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(stories)
      .innerJoin(creators, eq(stories.authorId, creators.id))
      .innerJoin(users, eq(creators.userId, users.id))
      .where(eq(stories.status, StoryStatus.PUBLISHED))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(stories.createdAt));
    
    // 스토리 ID 목록 추출
    const storyIds = storiesWithAuthors.map(story => story.id);
    
    // 스토리별 반응 정보 조회
    const reactionsData = await this.db
      .select({
        storyId: reactions.storyId,
        reactionType: reactions.reactionType,
        count: count(),
      })
      .from(reactions)
      .where(sql`${reactions.storyId} IN (${storyIds.length > 0 ? storyIds : [0]})`) // 빈 배열일 경우 대비
      .groupBy(reactions.storyId, reactions.reactionType);
    
    // 스토리별 반응 정보 매핑
    const reactionsByStoryId = reactionsData.reduce((acc, reaction) => { 
      // 숫자 타입으로 명시적 변환
      const storyId = reaction.storyId;
      
      if (!acc[storyId]) {
        acc[storyId] = [];
      }
      
      acc[storyId].push({
        reactionType: reaction.reactionType,
        count: reaction.count,
      });
      return acc;
    }, {} as Record<number, { reactionType: "like" | "heart" | "clap" | "fire" | "idea"; count: number }[]>);
    
    // 최종 결과 조합
    const items = storiesWithAuthors.map(story => ({
      id: story.id,
      title: story.title,
      coverImageUrl: story.coverImageUrl,
      authorId: story.authorId,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      author: {
        id: story.author.id,
        name: story.author.name,
        profileImageUrl: story.author.profileImageUrl,
      },
      reactions: reactionsByStoryId[story.id] || [],
    }));
    
    return {
      items,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      currentPage: page,
      itemsPerPage: limit,
      nextPage: offset + items.length < totalCount ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

}
