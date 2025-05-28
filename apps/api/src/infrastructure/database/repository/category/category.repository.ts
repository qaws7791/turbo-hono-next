import { asc, desc, eq, isNull } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { Category } from '../../../../domain/entity/category.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { CategoryType } from '../../../domain/category.types';
import { categories } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ICategoryRepository } from './category.repository.interface';

/**
 * 카테고리 리포지토리 구현
 * Drizzle ORM을 사용하여 카테고리 데이터에 접근합니다.
 */
@injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 카테고리 조회
   */
  async findById(id: number): Promise<Category | null> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 이름으로 카테고리 조회
   */
  async findByName(name: string): Promise<Category | null> {
    const result = await this.db.select().from(categories).where(eq(categories.name, name)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 타입으로 카테고리 목록 조회
   */
  async findByType(type: CategoryType): Promise<Category[]> {
    const result = await this.db.select().from(categories).where(eq(categories.type, type));
    return result.map(this.mapToEntity);
  }

  /**
   * 부모 ID로 카테고리 목록 조회
   */
  async findByParentId(parentId: number): Promise<Category[]> {
    const result = await this.db.select().from(categories).where(eq(categories.parentId, parentId));
    return result.map(this.mapToEntity);
  }

  /**
   * 루트 카테고리 목록 조회 (부모가 없는 카테고리)
   */
  async findRootCategories(): Promise<Category[]> {
    const result = await this.db.select().from(categories).where(isNull(categories.parentId));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 카테고리 조회
   */
  async findAll(filter?: Filter<Category>, sort?: SortOptions<Category>[]): Promise<Category[]> {
    let query = this.db.select().from(categories);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(categories.id, filter.id));
      }
      if (filter.name !== undefined) {
        query = query.where(eq(categories.name, filter.name));
      }
      if (filter.type !== undefined) {
        query = query.where(eq(categories.type, filter.type));
      }
      if (filter.parentId !== undefined) {
        query = query.where(eq(categories.parentId, filter.parentId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(categories.id)) 
              : query.orderBy(asc(categories.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(categories.name)) 
              : query.orderBy(asc(categories.name));
            break;
          case 'order':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(categories.order)) 
              : query.orderBy(asc(categories.order));
            break;
        }
      }
    } else {
      // 기본 정렬: 순서 오름차순
      query = query.orderBy(asc(categories.order));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 카테고리 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Category>,
    sort?: SortOptions<Category>[]
  ): Promise<PaginationResult<Category>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(categories);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(categories.id, filter.id));
      }
      if (filter.name !== undefined) {
        query = query.where(eq(categories.name, filter.name));
      }
      if (filter.type !== undefined) {
        query = query.where(eq(categories.type, filter.type));
      }
      if (filter.parentId !== undefined) {
        query = query.where(eq(categories.parentId, filter.parentId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(categories.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(categories.id)) 
              : query.orderBy(asc(categories.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(categories.name)) 
              : query.orderBy(asc(categories.name));
            break;
          case 'order':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(categories.order)) 
              : query.orderBy(asc(categories.order));
            break;
        }
      }
    } else {
      // 기본 정렬: 순서 오름차순
      query = query.orderBy(asc(categories.order));
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
   * 카테고리 생성
   */
  async create(entity: Category): Promise<Category> {
    const result = await this.db.insert(categories).values({
      name: entity.name,
      type: entity.type,
      parentId: entity.parentId,
      order: entity.order,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 카테고리 업데이트
   */
  async update(entity: Category): Promise<Category> {
    const result = await this.db.update(categories)
      .set({
        name: entity.name,
        type: entity.type,
        parentId: entity.parentId,
        order: entity.order,
        updatedAt: entity.updatedAt,
      })
      .where(eq(categories.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 카테고리 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof categories.$inferSelect): Category {
    return new Category(
      model.id,
      model.name,
      model.type as CategoryType,
      model.parentId,
      model.order,
      model.createdAt,
      model.updatedAt
    );
  }
}
