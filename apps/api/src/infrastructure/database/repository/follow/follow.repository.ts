import { DatabaseError } from '@/common/errors/database-error';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
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
    const [result] = await this.db.select().from(follows).where(eq(follows.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 사용자 ID로 팔로우 목록 조회 (사용자가 팔로우한 크리에이터 목록)
   */
  async findByUserId(userId: number): Promise<Follow[]> {
    const result = await this.db.select().from(follows).where(eq(follows.followerId, userId));
    return result.map(this.mapToEntity);
  }

  /**
   * 크리에이터 ID로 팔로우 목록 조회 (크리에이터를 팔로우한 사용자 목록)
   */
  async findByCreatorId(creatorId: number): Promise<Follow[]> {
    const result = await this.db.select().from(follows).where(eq(follows.followingId, creatorId));
    return result.map(this.mapToEntity);
  }

  /**
   * 사용자 ID와 크리에이터 ID로 팔로우 조회
   */
  async findByUserIdAndCreatorId(userId: number, creatorId: number): Promise<Follow | null> {
    const [result] = await this.db.select().from(follows)
      .where(and(
        eq(follows.followerId, userId),
        eq(follows.followingId, creatorId)
      ))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 크리에이터 ID로 팔로워 수 조회
   */
  async countByCreatorId(creatorId: number): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(follows)
      .where(eq(follows.followingId, creatorId));
    
    if (!result) {
      return 0;
    }
    
    return result.count;
  }

  /**
   * 사용자 ID로 팔로잉 수 조회
   */
  async countByUserId(userId: number): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(follows)
      .where(eq(follows.followerId, userId));
    
    if (!result) {
      return 0;
    }
    
    return result.count;
  }

  /**
   * 모든 팔로우 조회
   */
  async findAll(filter?: Filter<Follow>, sort?: SortOptions<Follow>[]): Promise<Follow[]> {
    const query = this.db.select().from(follows);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(follows.id, filter.id));
      }
      if (filter.followerId !== undefined) {
        filterSQLs.push(eq(follows.followerId, filter.followerId));
      }
      if (filter.followingId !== undefined) {
        filterSQLs.push(eq(follows.followingId, filter.followingId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(follows.id) 
              : asc(follows.id));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(follows.createdAt) 
              : asc(follows.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      orderSQLs.push(desc(follows.createdAt));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(follows).limit(limit).offset((page - 1) * limit);
    const filterSQLs:SQL[] = [];
    const orderSQLs:SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(follows.id, filter.id));
      }
      if (filter.followerId !== undefined) {
        filterSQLs.push(eq(follows.followerId, filter.followerId));
      }
      if (filter.followingId !== undefined) {
        filterSQLs.push(eq(follows.followingId, filter.followingId));
      }
    }

    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(follows.id) 
              : asc(follows.id));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(follows.createdAt) 
              : asc(follows.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(follows.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);

    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(follows).where(and(...filterSQLs));
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
   * 팔로우 생성
   */
  async create(entity: Follow): Promise<Follow> {
    const [result] = await this.db.insert(follows).values({
      followerId: entity.followerId,
      followingId: entity.followingId,
      createdAt: entity.createdAt,
    }).returning();

    if (!result) {
      throw new DatabaseError('팔로우 생성 실패', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
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
        eq(follows.followerId, userId),
        eq(follows.followingId, creatorId)
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
      model.followerId,
      model.followingId,
      model.createdAt
    );
  }
}
