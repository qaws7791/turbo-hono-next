import { asc, desc, eq, lt } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { Session } from '../../../../domain/entity/session.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { sessions } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ISessionRepository } from './session.repository.interface';

/**
 * 세션 리포지토리 구현
 * Drizzle ORM을 사용하여 세션 데이터에 접근합니다.
 */
@injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 세션 조회
   */
  async findById(id: number): Promise<Session | null> {
    const result = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 토큰으로 세션 조회
   */
  async findByToken(token: string): Promise<Session | null> {
    const result = await this.db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 사용자 ID로 세션 목록 조회
   */
  async findByUserId(userId: number): Promise<Session[]> {
    const result = await this.db.select().from(sessions).where(eq(sessions.userId, userId));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 세션 조회
   */
  async findAll(filter?: Filter<Session>, sort?: SortOptions<Session>[]): Promise<Session[]> {
    let query = this.db.select().from(sessions);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(sessions.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(sessions.userId, filter.userId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.id)) 
              : query.orderBy(asc(sessions.id));
            break;
          case 'userId':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.userId)) 
              : query.orderBy(asc(sessions.userId));
            break;
          case 'expiresAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.expiresAt)) 
              : query.orderBy(asc(sessions.expiresAt));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.createdAt)) 
              : query.orderBy(asc(sessions.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(sessions.id));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 세션 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Session>,
    sort?: SortOptions<Session>[]
  ): Promise<PaginationResult<Session>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(sessions);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(sessions.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(sessions.userId, filter.userId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(sessions.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.id)) 
              : query.orderBy(asc(sessions.id));
            break;
          case 'userId':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.userId)) 
              : query.orderBy(asc(sessions.userId));
            break;
          case 'expiresAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.expiresAt)) 
              : query.orderBy(asc(sessions.expiresAt));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sessions.createdAt)) 
              : query.orderBy(asc(sessions.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(sessions.id));
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
   * 세션 생성
   */
  async create(entity: Session): Promise<Session> {
    const result = await this.db.insert(sessions).values({
      userId: entity.userId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 세션 업데이트
   */
  async update(entity: Session): Promise<Session> {
    const result = await this.db.update(sessions)
      .set({
        expiresAt: entity.expiresAt,
        updatedAt: entity.updatedAt,
      })
      .where(eq(sessions.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 세션 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(sessions).where(eq(sessions.id, id)).returning();
    return result.length > 0;
  }

  /**
   * 사용자 ID로 세션 삭제
   */
  async deleteByUserId(userId: number): Promise<boolean> {
    const result = await this.db.delete(sessions).where(eq(sessions.userId, userId)).returning();
    return result.length > 0;
  }

  /**
   * 만료된 세션 삭제
   */
  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(sessions)
      .where(lt(sessions.expiresAt, now))
      .returning();
    
    return result.length;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof sessions.$inferSelect): Session {
    return new Session(
      model.id,
      model.userId,
      model.token,
      model.expiresAt,
      model.createdAt,
      model.updatedAt
    );
  }
}
