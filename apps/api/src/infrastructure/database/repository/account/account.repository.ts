import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
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
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 계정 조회
   */
  async findById(id: number): Promise<Account | null> {
    const [result] = await this.db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
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
    const [result] = await this.db.select().from(accounts).where(
      and(
        eq(accounts.providerId, providerId),
        eq(accounts.providerAccountId, providerAccountId)
      )
    ).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 모든 계정 조회
   */
  async findAll(filter?: Filter<Account>, sort?: SortOptions<Account>[]): Promise<Account[]> {
    const query = this.db.select().from(accounts);
    const filterSQLs:SQL[] = [];
    const orders:SQL[] = [];

    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(accounts.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(accounts.userId, filter.userId));
      }
      if (filter.providerId !== undefined) {
        filterSQLs.push(eq(accounts.providerId, filter.providerId));
      }
    }

    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orders.push(sortOption.order === 'desc' 
              ? desc(accounts.id) 
              : asc(accounts.id));
            break;
          case 'userId':
            orders.push(sortOption.order === 'desc' 
              ? desc(accounts.userId) 
              : asc(accounts.userId));
            break;
          case 'createdAt':
            orders.push(sortOption.order === 'desc' 
              ? desc(accounts.createdAt) 
              : asc(accounts.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orders.push(asc(accounts.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orders);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(accounts).limit(limit).offset((page - 1) * limit);
    const filterSQLs:SQL[] = [];
    const orders:SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(accounts.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(accounts.userId, filter.userId));
      }
      if (filter.providerId !== undefined) {
        filterSQLs.push(eq(accounts.providerId, filter.providerId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orders.push(sortOption.order === 'desc' 
              ? desc(accounts.id) 
              : asc(accounts.id));
            break;
          case 'userId':
            orders.push(sortOption.order === 'desc' 
              ? desc(accounts.userId) 
              : asc(accounts.userId));
            break;
          case 'createdAt':
            orders.push(sortOption.order === 'desc' 
              ? desc(accounts.createdAt) 
              : asc(accounts.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orders.push(asc(accounts.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orders);
    const [countResult] = await  this.db.select({ totalCount: count() }).from(accounts).where(and(...filterSQLs));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const items = result.map(this.mapToEntity);
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
   * 계정 생성
   */
  async create(entity: Account): Promise<Account> {
    const [result] = await this.db.insert(accounts).values({
      userId: entity.userId,
      providerId: entity.providerId,
      providerAccountId: entity.providerAccountId,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();

    if (!result) {
      throw new DatabaseError("계정 생성에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 계정 업데이트
   */
  async update(entity: Account): Promise<Account> {
    const [result] = await this.db.update(accounts)
      .set({
        password: entity.password,
        updatedAt: entity.updatedAt,
      })
      .where(eq(accounts.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("계정 업데이트에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
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
