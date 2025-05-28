import { asc, desc, eq, lt } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { EmailVerificationToken } from '../../../../domain/entity/email-verification.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { emailVerificationTokens } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { IEmailVerificationTokenRepository } from './email-verification.repository.interface';

/**
 * 이메일 인증 토큰 리포지토리 구현
 * Drizzle ORM을 사용하여 이메일 인증 토큰 데이터에 접근합니다.
 */
@injectable()
export class EmailVerificationTokenRepository implements IEmailVerificationTokenRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 이메일 인증 토큰 조회
   */
  async findById(id: number): Promise<EmailVerificationToken | null> {
    const result = await this.db.select().from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, id))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 토큰으로 이메일 인증 토큰 조회
   */
  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    const result = await this.db.select().from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 사용자 ID로 이메일 인증 토큰 조회
   */
  async findByUserId(userId: number): Promise<EmailVerificationToken | null> {
    const result = await this.db.select().from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 모든 이메일 인증 토큰 조회
   */
  async findAll(filter?: Filter<EmailVerificationToken>, sort?: SortOptions<EmailVerificationToken>[]): Promise<EmailVerificationToken[]> {
    let query = this.db.select().from(emailVerificationTokens);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(emailVerificationTokens.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(emailVerificationTokens.userId, filter.userId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.id)) 
              : query.orderBy(asc(emailVerificationTokens.id));
            break;
          case 'userId':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.userId)) 
              : query.orderBy(asc(emailVerificationTokens.userId));
            break;
          case 'expiresAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.expiresAt)) 
              : query.orderBy(asc(emailVerificationTokens.expiresAt));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.createdAt)) 
              : query.orderBy(asc(emailVerificationTokens.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(emailVerificationTokens.id));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 이메일 인증 토큰 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<EmailVerificationToken>,
    sort?: SortOptions<EmailVerificationToken>[]
  ): Promise<PaginationResult<EmailVerificationToken>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(emailVerificationTokens);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(emailVerificationTokens.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(emailVerificationTokens.userId, filter.userId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(emailVerificationTokens.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.id)) 
              : query.orderBy(asc(emailVerificationTokens.id));
            break;
          case 'userId':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.userId)) 
              : query.orderBy(asc(emailVerificationTokens.userId));
            break;
          case 'expiresAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.expiresAt)) 
              : query.orderBy(asc(emailVerificationTokens.expiresAt));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(emailVerificationTokens.createdAt)) 
              : query.orderBy(asc(emailVerificationTokens.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(emailVerificationTokens.id));
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
   * 이메일 인증 토큰 생성
   */
  async create(entity: EmailVerificationToken): Promise<EmailVerificationToken> {
    const result = await this.db.insert(emailVerificationTokens).values({
      userId: entity.userId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 이메일 인증 토큰 업데이트
   */
  async update(entity: EmailVerificationToken): Promise<EmailVerificationToken> {
    const result = await this.db.update(emailVerificationTokens)
      .set({
        expiresAt: entity.expiresAt,
      })
      .where(eq(emailVerificationTokens.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 이메일 인증 토큰 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, id))
      .returning();
    
    return result.length > 0;
  }

  /**
   * 사용자 ID로 이메일 인증 토큰 삭제
   */
  async deleteByUserId(userId: number): Promise<boolean> {
    const result = await this.db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId))
      .returning();
    
    return result.length > 0;
  }

  /**
   * 만료된 이메일 인증 토큰 삭제
   */
  async deleteExpiredTokens(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(emailVerificationTokens)
      .where(lt(emailVerificationTokens.expiresAt, now))
      .returning();
    
    return result.length;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof emailVerificationTokens.$inferSelect): EmailVerificationToken {
    return new EmailVerificationToken(
      model.id,
      model.userId,
      model.token,
      model.expiresAt,
      model.createdAt
    );
  }
}
