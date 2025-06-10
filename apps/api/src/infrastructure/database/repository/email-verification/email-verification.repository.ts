import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, lt, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
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
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 이메일 인증 토큰 조회
   */
  async findById(id: number): Promise<EmailVerificationToken | null> {
    const [result] = await this.db.select().from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, id))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 토큰으로 이메일 인증 토큰 조회
   */
  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    const [result] = await this.db.select().from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 사용자 ID로 이메일 인증 토큰 조회
   */
  async findByUserId(userId: number): Promise<EmailVerificationToken | null> {
    const [result] = await this.db.select().from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 모든 이메일 인증 토큰 조회
   */
  async findAll(filter?: Filter<EmailVerificationToken>, sort?: SortOptions<EmailVerificationToken>[]): Promise<EmailVerificationToken[]> {
    const query = this.db.select().from(emailVerificationTokens);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(emailVerificationTokens.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(emailVerificationTokens.userId, filter.userId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.id) 
              : asc(emailVerificationTokens.id));
            break;
          case 'userId':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.userId) 
              : asc(emailVerificationTokens.userId));
            break;
          case 'expiresAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.expiresAt) 
              : asc(emailVerificationTokens.expiresAt));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.createdAt) 
              : asc(emailVerificationTokens.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(emailVerificationTokens.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(emailVerificationTokens).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(emailVerificationTokens.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(emailVerificationTokens.userId, filter.userId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.id) 
              : asc(emailVerificationTokens.id));
            break;
          case 'userId':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.userId) 
              : asc(emailVerificationTokens.userId));
            break;
          case 'expiresAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.expiresAt) 
              : asc(emailVerificationTokens.expiresAt));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(emailVerificationTokens.createdAt) 
              : asc(emailVerificationTokens.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(emailVerificationTokens.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    
    // 결과 변환
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(emailVerificationTokens).where(and(...filterSQLs));
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
   * 이메일 인증 토큰 생성
   */
  async create(entity: EmailVerificationToken): Promise<EmailVerificationToken> {
    const [result] = await this.db.insert(emailVerificationTokens).values({
      userId: entity.userId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    }).returning();
    
    if (!result) {
      throw new DatabaseError('이메일 인증 토큰 생성 실패', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 이메일 인증 토큰 업데이트
   */
  async update(entity: EmailVerificationToken): Promise<EmailVerificationToken> {
    const [result] = await this.db.update(emailVerificationTokens)
      .set({
        expiresAt: entity.expiresAt,
      })
      .where(eq(emailVerificationTokens.id, entity.id))
      .returning();

    if (!result) {
      throw new DatabaseError('이메일 인증 토큰 업데이트 실패', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 이메일 인증 토큰 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const [result] = await this.db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, id))
      .returning();
    
    return result !== undefined;
  }

  /**
   * 사용자 ID로 이메일 인증 토큰 삭제
   */
  async deleteByUserId(userId: number): Promise<boolean> {
    const [result] = await this.db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId))
      .returning();
    
    return result !== undefined;
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
