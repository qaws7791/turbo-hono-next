import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, ilike, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
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
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 스토리 조회
   */
  async findById(id: number): Promise<Story | null> {
    const [result] = await this.db.select().from(stories).where(eq(stories.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 크리에이터 ID로 스토리 목록 조회
   */
  async findByCreatorId(creatorId: number, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>> {
    const { limit, page = 1 } = paginationOptions;
    const result = await this.db.select().from(stories).where(eq(stories.authorId, creatorId)).limit(limit).offset((page - 1) * limit);


    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(stories).where(eq(stories.authorId, creatorId));
    const totalCount = countResult?.totalCount || 0;
                                    
    // 결과 변환
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;
    const itemsPerPage = limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
                                        
    return {
      items,
      totalPages,
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      nextPage, 
      prevPage,
    };
  }

  /**
   * 상태로 스토리 목록 조회
   */
  async findByStatus(status: StoryStatus, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>> {
    const { limit, page = 1 } = paginationOptions;
    const result = await this.db.select().from(stories).where(eq(stories.status, status)).limit(limit).offset((page - 1) * limit);
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(stories).where(eq(stories.status, status));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;
    const itemsPerPage = limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    
    return {
      items,
      totalPages,
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      nextPage, 
      prevPage,
    };
  }

  /**
   * 크리에이터 ID와 상태로 스토리 목록 조회
   */
  async findByCreatorIdAndStatus({ creatorId, status }: { creatorId: number; status: StoryStatus }, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>> {
    const { limit, page = 1 } = paginationOptions;
    const result = await this.db.select().from(stories)
      .where(and(
        eq(stories.authorId, creatorId),
        eq(stories.status, status)
      ));
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(stories).where(and(
      eq(stories.authorId, creatorId),
      eq(stories.status, status)
    ));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;
    const itemsPerPage = limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    
    return {
      items,
      totalPages,
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      nextPage, 
      prevPage,
    };
  }

  /**
   * 제목 검색으로 스토리 목록 조회
   */
  async searchByTitle(title: string, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>> {
    const { limit, page = 1 } = paginationOptions;
    const result = await this.db.select().from(stories)
      .where(ilike(stories.title, `%${title}%`));
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(stories).where(ilike(stories.title, `%${title}%`));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;
    const itemsPerPage = limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    
    return {
      items,
      totalPages,
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      nextPage, 
      prevPage,
    };
  }

  /**
   * 내용 검색으로 스토리 목록 조회
   */
  async searchByContent(content: string, paginationOptions: PaginationOptions): Promise<PaginationResult<Story>> {
    const { limit, page = 1 } = paginationOptions;
    const result = await this.db.select().from(stories)
      .where(ilike(stories.contentText, `%${content}%`));
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(stories).where(ilike(stories.contentText, `%${content}%`));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;
    const itemsPerPage = limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    
    return {
      items,
      totalPages,
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      nextPage, 
      prevPage,
    };
  }

  /**
   * 모든 스토리 조회
   */
  async findAll(filter?: Filter<Story>, sort?: SortOptions<Story>[]): Promise<Story[]> {
    const query = this.db.select().from(stories);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(stories.id, filter.id));
      }
      if (filter.authorId !== undefined) {
        filterSQLs.push(eq(stories.authorId, filter.authorId));
      }
      if (filter.status !== undefined) {
        filterSQLs.push(eq(stories.status, filter.status));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(stories.id) 
              : asc(stories.id));
            break;
          case 'title':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(stories.title) 
              : asc(stories.title));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(stories.createdAt) 
              : asc(stories.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      orderSQLs.push(desc(stories.createdAt));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(stories).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(stories.id, filter.id));
      }
      if (filter.authorId !== undefined) {
        filterSQLs.push(eq(stories.authorId, filter.authorId));
      }
      if (filter.status !== undefined) {
        filterSQLs.push(eq(stories.status, filter.status));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(stories.id) 
              : asc(stories.id));
            break;
          case 'title':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(stories.title) 
              : asc(stories.title));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(stories.createdAt) 
              : asc(stories.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      orderSQLs.push(desc(stories.createdAt));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(stories).where(and(...filterSQLs));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;
    const itemsPerPage = limit;
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    
    return {
      items,
      totalPages,
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      nextPage, 
      prevPage,
    };
  }

  /**
   * 스토리 생성
   */
  async create(entity: Story): Promise<Story> {
    const [result] = await this.db.insert(stories).values({
      authorId: entity.authorId,
      title: entity.title,
      coverImageUrl: entity.coverImageUrl,
      content: entity.content,
      contentText: entity.contentText,
      status: entity.status,
      createdAt: entity.createdAt,
      publishedAt: entity.publishedAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    }).returning();

    if (!result) {
      throw new DatabaseError("스토리 생성에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 스토리 업데이트
   */
  async update(entity: Story): Promise<Story> {
    const [result] = await this.db.update(stories)
      .set({
        title: entity.title,
        content: entity.content,
        coverImageUrl: entity.coverImageUrl,
        contentText: entity.contentText,
        status: entity.status,
        updatedAt: entity.updatedAt,
        publishedAt: entity.publishedAt,
        deletedAt: entity.deletedAt,
      })
      .where(eq(stories.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("스토리 업데이트에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
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
      model.authorId,
      model.title,
      model.content as string,
      model.contentText,
      model.coverImageUrl,
      model.status as StoryStatus,
      model.createdAt,
      model.updatedAt,
      model.publishedAt,
      model.deletedAt,
    );
  }
}
