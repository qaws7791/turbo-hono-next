import { and, asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
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
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 사용자 조회
   */
  async findById(id: number): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
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
    let query = this.db.select().from(users);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(users.id, filter.id));
      }
      if (filter.email !== undefined) {
        query = query.where(eq(users.email, filter.email));
      }
      if (filter.role !== undefined) {
        query = query.where(eq(users.role, filter.role));
      }
      if (filter.status !== undefined) {
        query = query.where(eq(users.status, filter.status));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(users.id)) 
              : query.orderBy(asc(users.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(users.name)) 
              : query.orderBy(asc(users.name));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(users.createdAt)) 
              : query.orderBy(asc(users.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(users.id));
    }
    
    const result = await query;
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
    const { limit, cursor } = options;
    let query = this.db.select().from(users);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(users.id, filter.id));
      }
      if (filter.email !== undefined) {
        query = query.where(eq(users.email, filter.email));
      }
      if (filter.role !== undefined) {
        query = query.where(eq(users.role, filter.role));
      }
      if (filter.status !== undefined) {
        query = query.where(eq(users.status, filter.status));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(users.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(users.id)) 
              : query.orderBy(asc(users.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(users.name)) 
              : query.orderBy(asc(users.name));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(users.createdAt)) 
              : query.orderBy(asc(users.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(users.id));
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
   * 사용자 생성
   */
  async create(entity: User): Promise<User> {
    const result = await this.db.insert(users).values({
      name: entity.name,
      email: entity.email,
      emailVerified: entity.emailVerified,
      profileImageUrl: entity.profileImageUrl,
      role: entity.role,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 사용자 업데이트
   */
  async update(entity: User): Promise<User> {
    const result = await this.db.update(users)
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
    
    return this.mapToEntity(result[0]);
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
