import { and, asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { Account } from '../../../../domain/entity/account.entity';
import { SocialProvider } from '../../../../domain/entity/user.types';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { accounts } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { IAccountRepository } from './account.repository.interface';

/**
 * 계정 리포지토리 구현
 * Drizzle ORM을 사용하여 계정 데이터에 접근합니다.
 */
@injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 계정 조회
   */
  async findById(id: number): Promise<Account | null> {
    const result = await this.db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 사용자 ID로 계정 목록 조회
   */
  async findByUserId(userId: number): Promise<Account[]> {
    const result = await this.db.select().from(accounts).where(eq(accounts.userId, userId));
    return result.map(this.mapToEntity);
  }

  /**
   * 제공자와 제공자 계정 ID로 계정 조회
   */
  async findByProviderAndProviderAccountId(
    providerId: SocialProvider,
    providerAccountId: string
  ): Promise<Account | null> {
    const result = await this.db.select().from(accounts).where(
      and(
        eq(accounts.providerId, providerId),
        eq(accounts.providerAccountId, providerAccountId)
      )
    ).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 모든 계정 조회
   */
  async findAll(filter?: Filter<Account>, sort?: SortOptions<Account>[]): Promise<Account[]> {
    let query = this.db.select().from(accounts);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(accounts.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(accounts.userId, filter.userId));
      }
      if (filter.providerId !== undefined) {
        query = query.where(eq(accounts.providerId, filter.providerId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(accounts.id)) 
              : query.orderBy(asc(accounts.id));
            break;
          case 'userId':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(accounts.userId)) 
              : query.orderBy(asc(accounts.userId));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(accounts.createdAt)) 
              : query.orderBy(asc(accounts.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(accounts.id));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 계정 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Account>,
    sort?: SortOptions<Account>[]
  ): Promise<PaginationResult<Account>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(accounts);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(accounts.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(accounts.userId, filter.userId));
      }
      if (filter.providerId !== undefined) {
        query = query.where(eq(accounts.providerId, filter.providerId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(accounts.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(accounts.id)) 
              : query.orderBy(asc(accounts.id));
            break;
          case 'userId':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(accounts.userId)) 
              : query.orderBy(asc(accounts.userId));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(accounts.createdAt)) 
              : query.orderBy(asc(accounts.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(accounts.id));
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
   * 계정 생성
   */
  async create(entity: Account): Promise<Account> {
    const result = await this.db.insert(accounts).values({
      userId: entity.userId,
      providerId: entity.providerId,
      providerAccountId: entity.providerAccountId,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 계정 업데이트
   */
  async update(entity: Account): Promise<Account> {
    const result = await this.db.update(accounts)
      .set({
        password: entity.password,
        updatedAt: entity.updatedAt,
      })
      .where(eq(accounts.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 계정 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(accounts).where(eq(accounts.id, id)).returning();
    return result.length > 0;
  }

  /**
   * 사용자 ID로 계정 삭제
   */
  async deleteByUserId(userId: number): Promise<boolean> {
    const result = await this.db.delete(accounts).where(eq(accounts.userId, userId)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof accounts.$inferSelect): Account {
    return new Account(
      model.id,
      model.userId,
      model.providerId as SocialProvider,
      model.providerAccountId,
      model.password,
      model.createdAt,
      model.updatedAt
    );
  }
}
