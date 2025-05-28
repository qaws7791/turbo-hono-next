import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { Story } from '../../../../domain/entity/story.entity';
import { StoryStatus } from '../../../../domain/entity/story.types';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { stories } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { IStoryRepository } from './story.repository.interface';

/**
 * 스토리 리포지토리 구현
 * Drizzle ORM을 사용하여 스토리 데이터에 접근합니다.
 */
@injectable()
export class StoryRepository implements IStoryRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 스토리 조회
   */
  async findById(id: number): Promise<Story | null> {
    const result = await this.db.select().from(stories).where(eq(stories.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 크리에이터 ID로 스토리 목록 조회
   */
  async findByCreatorId(creatorId: number): Promise<Story[]> {
    const result = await this.db.select().from(stories).where(eq(stories.creatorId, creatorId));
    return result.map(this.mapToEntity);
  }

  /**
   * 상태로 스토리 목록 조회
   */
  async findByStatus(status: StoryStatus): Promise<Story[]> {
    const result = await this.db.select().from(stories).where(eq(stories.status, status));
    return result.map(this.mapToEntity);
  }

  /**
   * 카테고리 ID로 스토리 목록 조회
   */
  async findByCategoryId(categoryId: number): Promise<Story[]> {
    const result = await this.db.select().from(stories).where(eq(stories.categoryId, categoryId));
    return result.map(this.mapToEntity);
  }

  /**
   * 크리에이터 ID와 상태로 스토리 목록 조회
   */
  async findByCreatorIdAndStatus(creatorId: number, status: StoryStatus): Promise<Story[]> {
    const result = await this.db.select().from(stories)
      .where(and(
        eq(stories.creatorId, creatorId),
        eq(stories.status, status)
      ));
    return result.map(this.mapToEntity);
  }

  /**
   * 제목 검색으로 스토리 목록 조회
   */
  async searchByTitle(title: string): Promise<Story[]> {
    const result = await this.db.select().from(stories)
      .where(ilike(stories.title, `%${title}%`));
    return result.map(this.mapToEntity);
  }

  /**
   * 내용 검색으로 스토리 목록 조회
   */
  async searchByContent(content: string): Promise<Story[]> {
    const result = await this.db.select().from(stories)
      .where(ilike(stories.content, `%${content}%`));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 스토리 조회
   */
  async findAll(filter?: Filter<Story>, sort?: SortOptions<Story>[]): Promise<Story[]> {
    let query = this.db.select().from(stories);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(stories.id, filter.id));
      }
      if (filter.creatorId !== undefined) {
        query = query.where(eq(stories.creatorId, filter.creatorId));
      }
      if (filter.status !== undefined) {
        query = query.where(eq(stories.status, filter.status));
      }
      if (filter.categoryId !== undefined) {
        query = query.where(eq(stories.categoryId, filter.categoryId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(stories.id)) 
              : query.orderBy(asc(stories.id));
            break;
          case 'title':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(stories.title)) 
              : query.orderBy(asc(stories.title));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(stories.createdAt)) 
              : query.orderBy(asc(stories.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      query = query.orderBy(desc(stories.createdAt));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 스토리 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Story>,
    sort?: SortOptions<Story>[]
  ): Promise<PaginationResult<Story>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(stories);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(stories.id, filter.id));
      }
      if (filter.creatorId !== undefined) {
        query = query.where(eq(stories.creatorId, filter.creatorId));
      }
      if (filter.status !== undefined) {
        query = query.where(eq(stories.status, filter.status));
      }
      if (filter.categoryId !== undefined) {
        query = query.where(eq(stories.categoryId, filter.categoryId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(stories.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(stories.id)) 
              : query.orderBy(asc(stories.id));
            break;
          case 'title':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(stories.title)) 
              : query.orderBy(asc(stories.title));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(stories.createdAt)) 
              : query.orderBy(asc(stories.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      query = query.orderBy(desc(stories.createdAt));
    }
    
    // 제한 적용
    query = query.limit(limit + 1); // 다음 페이지 확인을 위해 limit + 1
    
    const result = await query;
    
    // 결과 변환
    const items = result.slice(0, limit).map(this.mapToEntity);
    const hasMore = result.length > limit;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;
    
    return {
      items,
      hasMore,
      nextCursor,
    };
  }

  /**
   * 스토리 생성
   */
  async create(entity: Story): Promise<Story> {
    const result = await this.db.insert(stories).values({
      creatorId: entity.creatorId,
      title: entity.title,
      content: entity.content,
      thumbnailUrl: entity.thumbnailUrl,
      categoryId: entity.categoryId,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      publishedAt: entity.publishedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 스토리 업데이트
   */
  async update(entity: Story): Promise<Story> {
    const result = await this.db.update(stories)
      .set({
        title: entity.title,
        content: entity.content,
        thumbnailUrl: entity.thumbnailUrl,
        categoryId: entity.categoryId,
        status: entity.status,
        updatedAt: entity.updatedAt,
        publishedAt: entity.publishedAt,
      })
      .where(eq(stories.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 스토리 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(stories).where(eq(stories.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof stories.$inferSelect): Story {
    return new Story(
      model.id,
      model.creatorId,
      model.title,
      model.content,
      model.thumbnailUrl,
      model.categoryId,
      model.status as StoryStatus,
      model.createdAt,
      model.updatedAt,
      model.publishedAt
    );
  }
}
