import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { User } from '../../../../domain/entity/user.entity';
import { UserRole, UserStatus } from '../../../../domain/entity/user.types';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { users } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { IUserRepository } from './user.repository.interface';

/**
 * 사용자 리포지토리 구현
 * Drizzle ORM을 사용하여 사용자 데이터에 접근합니다.
 */
@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 사용자 조회
   */
  async findById(id: number): Promise<User | null> {
    const [result] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 역할로 사용자 목록 조회
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const result = await this.db.select().from(users).where(eq(users.role, role));
    return result.map(this.mapToEntity);
  }

  /**
   * 상태로 사용자 목록 조회
   */
  async findByStatus(status: UserStatus): Promise<User[]> {
    const result = await this.db.select().from(users).where(eq(users.status, status));
    return result.map(this.mapToEntity);
  }

  /**
   * 역할과 상태로 사용자 목록 조회
   */
  async findByRoleAndStatus(role: UserRole, status: UserStatus): Promise<User[]> {
    const result = await this.db.select().from(users).where(
      and(
        eq(users.role, role),
        eq(users.status, status)
      )
    );
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 사용자 조회
   */
  async findAll(filter?: Filter<User>, sort?: SortOptions<User>[]): Promise<User[]> {
    const query = this.db.select().from(users);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(users.id, filter.id));
      }
      if (filter.email !== undefined) {
        filterSQLs.push(eq(users.email, filter.email));
      }
      if (filter.role !== undefined) {
        filterSQLs.push(eq(users.role, filter.role));
      }
      if (filter.status !== undefined) {
        filterSQLs.push(eq(users.status, filter.status));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(users.id) 
              : asc(users.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(users.name) 
              : asc(users.name));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(users.createdAt) 
              : asc(users.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(users.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 사용자 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<User>,
    sort?: SortOptions<User>[]
  ): Promise<PaginationResult<User>> {
    const { limit, page = 1 } = options;
    const query = this.db.select().from(users).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(users.id, filter.id));
      }
      if (filter.email !== undefined) {
        filterSQLs.push(eq(users.email, filter.email));
      }
      if (filter.role !== undefined) {
        filterSQLs.push(eq(users.role, filter.role));
      }
      if (filter.status !== undefined) {
        filterSQLs.push(eq(users.status, filter.status));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(users.id) 
              : asc(users.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(users.name) 
              : asc(users.name));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(users.createdAt) 
              : asc(users.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(users.id));
    }
    
    const result = await query;
    
    // 결과 변환
    const items = result.slice(0, limit).map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(users).where(and(...filterSQLs));
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
   * 사용자 생성
   */
  async create(entity: User): Promise<User> {
    const [result] = await this.db.insert(users).values({
      name: entity.name,
      email: entity.email,
      emailVerified: entity.emailVerified,
      profileImageUrl: entity.profileImageUrl,
      role: entity.role,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();

    if (!result) {
      throw new DatabaseError('사용자 생성에 실패했습니다.', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 사용자 업데이트
   */
  async update(entity: User): Promise<User> {
    const [result] = await this.db.update(users)
      .set({
        name: entity.name,
        email: entity.email,
        emailVerified: entity.emailVerified,
        profileImageUrl: entity.profileImageUrl,
        role: entity.role,
        status: entity.status,
        updatedAt: entity.updatedAt,
      })
      .where(eq(users.id, entity.id))
      .returning();

    if (!result) {
      throw new DatabaseError('사용자 업데이트에 실패했습니다.', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 사용자 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof users.$inferSelect): User {
    return new User(
      model.id,
      model.name,
      model.email,
      model.emailVerified,
      model.profileImageUrl,
      model.role as UserRole,
      model.status as UserStatus,
      model.createdAt,
      model.updatedAt
    );
  }
}
