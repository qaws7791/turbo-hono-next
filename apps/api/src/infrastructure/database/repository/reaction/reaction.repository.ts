import { DatabaseError } from '@/common/errors/database-error';
import { ReactionType } from '@/domain/entity/story.types';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { Reaction } from '../../../../domain/entity/reaction.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { reactions } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { IReactionRepository } from './reaction.repository.interface';

/**
 * 리액션 리포지토리 구현
 * Drizzle ORM을 사용하여 리액션 데이터에 접근합니다.
 */
@injectable()
export class ReactionRepository implements IReactionRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 리액션 조회
   */
  async findById(id: number): Promise<Reaction | null> {
    const [result] = await this.db.select().from(reactions).where(eq(reactions.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 사용자 ID로 리액션 목록 조회
   */
  async findByUserId(userId: number): Promise<Reaction[]> {
    const result = await this.db.select().from(reactions).where(eq(reactions.userId, userId));
    return result.map(this.mapToEntity);
  }

  /**
   * 스토리 ID로 리액션 목록 조회
   */
  async findByStoryId(storyId: number): Promise<Reaction[]> {
    const result = await this.db.select().from(reactions).where(eq(reactions.storyId, storyId));
    return result.map(this.mapToEntity);
  }

  /**
   * 사용자 ID와 스토리 ID로 리액션 조회
   */
  async findByUserIdAndStoryId(userId: number, storyId: number): Promise<Reaction | null> {
    const [result] = await this.db.select().from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.storyId, storyId)
      ))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 스토리 ID와 리액션 타입으로 리액션 수 조회
   */
  async countByStoryIdAndType(storyId: number, type: ReactionType): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(reactions)
      .where(and(
        eq(reactions.storyId, storyId),
        eq(reactions.reactionType, type)
      ));
    
    return result?.count || 0;
  }

  /**
   * 스토리 ID로 리액션 수 조회
   */
  async countByStoryId(storyId: number): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(reactions)
      .where(eq(reactions.storyId, storyId));
    
    return result?.count || 0;
  }

  /**
   * 모든 리액션 조회
   */
  async findAll(filter?: Filter<Reaction>, sort?: SortOptions<Reaction>[]): Promise<Reaction[]> {
    const query = this.db.select().from(reactions);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(reactions.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(reactions.userId, filter.userId));
      }
      if (filter.storyId !== undefined) {
        filterSQLs.push(eq(reactions.storyId, filter.storyId));
      }
      if (filter.reactionType !== undefined) {
        filterSQLs.push(eq(reactions.reactionType, filter.reactionType));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(reactions.id) 
              : asc(reactions.id));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(reactions.createdAt) 
              : asc(reactions.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      orderSQLs.push(desc(reactions.createdAt));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 리액션 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Reaction>,
    sort?: SortOptions<Reaction>[]
  ): Promise<PaginationResult<Reaction>> {
    const { limit, page = 1 } = options;
    const query = this.db.select().from(reactions).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(reactions.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(reactions.userId, filter.userId));
      }
      if (filter.storyId !== undefined) {
        filterSQLs.push(eq(reactions.storyId, filter.storyId));
      }
      if (filter.reactionType !== undefined) {
        filterSQLs.push(eq(reactions.reactionType, filter.reactionType));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(reactions.id) 
              : asc(reactions.id));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(reactions.createdAt) 
              : asc(reactions.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 생성일 내림차순 (최신순)
      orderSQLs.push(desc(reactions.createdAt));
    }
    
    const result = await query;
    
    // 결과 변환
    const items = result.slice(0, limit).map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(reactions).where(and(...filterSQLs));
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
   * 리액션 생성
   */
  async create(entity: Reaction): Promise<Reaction> {
    const [result] = await this.db.insert(reactions).values({
      userId: entity.userId,
      storyId: entity.storyId,
      reactionType: entity.reactionType,
      createdAt: entity.createdAt,
    }).returning();

    if (!result) {
      throw new DatabaseError("리액션 생성에 실패했습니다.", status.INTERNAL_SERVER_ERROR);
    }
      
    return this.mapToEntity(result);
  }

  /**
   * 리액션 업데이트
   */
  async update(entity: Reaction): Promise<Reaction> {
    const [result] = await this.db.update(reactions)
      .set({
        userId: entity.userId,
        storyId: entity.storyId,
        reactionType: entity.reactionType,
        createdAt: entity.createdAt,
      })
      .where(eq(reactions.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("리액션 업데이트에 실패했습니다.", status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 리액션 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(reactions).where(eq(reactions.id, id)).returning();
    return result.length > 0;
  }

  /**
   * 사용자 ID와 스토리 ID로 리액션 삭제
   */
  async deleteByUserIdAndStoryId(userId: number, storyId: number): Promise<boolean> {
    const result = await this.db.delete(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.storyId, storyId)
      ))
      .returning();
    
    return result.length > 0;
  }
  
  /**
   * 스토리 ID로 리액션 타입별 카운트 조회
   * @param storyId 스토리 ID
   * @returns 리액션 타입별 카운트 객체
   */
  async countTotalByStoryId(storyId: number): Promise<{ [key in ReactionType]: number }> {
    try {
      // 모든 리액션 타입에 대한 카운트를 한 번의 쿼리로 가져옴
      const result = await this.db
        .select({
          reactionType: reactions.reactionType,
          count: count(),
        })
        .from(reactions)
        .where(eq(reactions.storyId, storyId))
        .groupBy(reactions.reactionType);

      // 결과를 리액션 타입별로 매핑
      const reactionCounts: { [key in ReactionType]: number } = {
        like: 0,
        heart: 0,
        clap: 0,
        fire: 0,
        idea: 0,
      };

      // 쿼리 결과에서 카운트 값을 매핑
      result.forEach((item) => {
        const type = item.reactionType as ReactionType;
        reactionCounts[type] = Number(item.count) || 0;
      });

      return reactionCounts;
    } catch {
      throw new DatabaseError(
        `스토리 ID ${storyId}에 대한 리액션 카운트 조회에 실패했습니다.`,
        status.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof reactions.$inferSelect): Reaction {
    return new Reaction(
      model.id,
      model.storyId,
      model.userId,
      model.reactionType as ReactionType,
      model.createdAt
    );
  }
}
