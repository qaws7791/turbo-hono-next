import { and, asc, count, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { Follow } from '../../../../domain/entity/follow.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { follows } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { IFollowRepository } from './follow.repository.interface';

/**
 * 팔로우 리포지토리 구현
 * Drizzle ORM을 사용하여 팔로우 데이터에 접근합니다.
 */
@injectable()
export class FollowRepository implements IFollowRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 팔로우 조회
   */
  async findById(id: number): Promise<Follow | null> {
    const result = await this.db.select().from(follows).where(eq(follows.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 사용자 ID로 팔로우 목록 조회 (사용자가 팔로우한 크리에이터 목록)
   */
  async findByUserId(userId: number): Promise<Follow[]> {
    const result = await this.db.select().from(follows).where(eq(follows.userId, userId));
    return result.map(this.mapToEntity);
  }

  /**
   * 크리에이터 ID로 팔로우 목록 조회 (크리에이터를 팔로우한 사용자 목록)
   */
  async findByCreatorId(creatorId: number): Promise<Follow[]> {
    const result = await this.db.select().from(follows).where(eq(follows.creatorId, creatorId));
    return result.map(this.mapToEntity);
  }

  /**
   * 사용자 ID와 크리에이터 ID로 팔로우 조회
   */
  async findByUserIdAndCreatorId(userId: number, creatorId: number): Promise<Follow | null> {
    const result = await this.db.select().from(follows)
      .where(and(
        eq(follows.userId, userId),
        eq(follows.creatorId, creatorId)
      ))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 크리에이터 ID로 팔로워 수 조회
   */
  async countByCreatorId(creatorId: number): Promise<number> {
    const result = await this.db.select({ count: count() }).from(follows)
      .where(eq(follows.creatorId, creatorId));
    
    return result[0].count;
  }

  /**
   * 사용자 ID로 팔로잉 수 조회
   */
  async countByUserId(userId: number): Promise<number> {
    const result = await this.db.select({ count: count() }).from(follows)
      .where(eq(follows.userId, userId));
    
    return result[0].count;
  }

  /**
   * 모든 팔로우 조회
   */
  async findAll(filter?: Filter<Follow>, sort?: SortOptions<Follow>[]): Promise<Follow[]> {
    let query = this.db.select().from(follows);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(follows.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(follows.userId, filter.userId));
      }
      if (filter.creatorId !== undefined) {
        query = query.where(eq(follows.creatorId, filter.creatorId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(follows.id)) 
              : query.orderBy(asc(follows.id));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(follows.createdAt)) 
              : query.orderBy(asc(follows.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      query = query.orderBy(desc(follows.createdAt));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 팔로우 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Follow>,
    sort?: SortOptions<Follow>[]
  ): Promise<PaginationResult<Follow>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(follows);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(follows.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(follows.userId, filter.userId));
      }
      if (filter.creatorId !== undefined) {
        query = query.where(eq(follows.creatorId, filter.creatorId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(follows.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(follows.id)) 
              : query.orderBy(asc(follows.id));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(follows.createdAt)) 
              : query.orderBy(asc(follows.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      query = query.orderBy(desc(follows.createdAt));
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
   * 팔로우 생성
   */
  async create(entity: Follow): Promise<Follow> {
    const result = await this.db.insert(follows).values({
      userId: entity.userId,
      creatorId: entity.creatorId,
      createdAt: entity.createdAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 팔로우 업데이트
   */
  async update(entity: Follow): Promise<Follow> {
    // 팔로우 엔티티는 업데이트할 필드가 없으므로 그대로 반환
    return entity;
  }

  /**
   * ID로 팔로우 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(follows).where(eq(follows.id, id)).returning();
    return result.length > 0;
  }

  /**
   * 사용자 ID와 크리에이터 ID로 팔로우 삭제
   */
  async deleteByUserIdAndCreatorId(userId: number, creatorId: number): Promise<boolean> {
    const result = await this.db.delete(follows)
      .where(and(
        eq(follows.userId, userId),
        eq(follows.creatorId, creatorId)
      ))
      .returning();
    
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof follows.$inferSelect): Follow {
    return new Follow(
      model.id,
      model.userId,
      model.creatorId,
      model.createdAt
    );
  }
}
