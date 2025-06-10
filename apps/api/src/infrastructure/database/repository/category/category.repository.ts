import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { Category } from '../../../../domain/entity/category.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
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
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}

  /**
   * 슬러그로 카테고리 조회
   */
  async findBySlug(slug: string): Promise<Category | null> {
    const [result] = await this.db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 카테고리 사용 여부 확인
   */
  async isInUse(id: number): Promise<boolean> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    
    if (!result) {
      return false;
    }
    
    return true;
  }

  /**
   * ID로 카테고리 조회
   */
  async findById(id: number): Promise<Category | null> {
    const [result] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 이름으로 카테고리 조회
   */
  async findByName(name: string): Promise<Category | null> {
    const [result] = await this.db.select().from(categories).where(eq(categories.name, name)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }


  /**
   * 모든 카테고리 조회
   */
  async findAll(filter?: Filter<Category>, sort?: SortOptions<Category>[]): Promise<Category[]> {
    const query = this.db.select().from(categories);
    const filterSQLs:SQL[] = [];
    const orderSQLs:SQL[] = [];
    
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(categories.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(categories.name, filter.name));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(categories.id) 
              : asc(categories.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(categories.name) 
              : asc(categories.name));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(categories.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(categories).limit(limit).offset((page - 1) * limit);
    const filterSQLs:SQL[] = [];
    const orderSQLs:SQL[] = [];
    
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(categories.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(categories.name, filter.name));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(categories.id) 
              : asc(categories.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(categories.name) 
              : asc(categories.name));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(categories.id));
    }

    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    const [countResult] = await this.db.select({ totalCount: count() }).from(categories).where(and(...filterSQLs));
    const totalCount = countResult?.totalCount || 0;
    
    // 결과 변환
    const items = result.slice(0, limit).map(this.mapToEntity);
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
   * 카테고리 생성
   */
  async create(entity: Category): Promise<Category> {
    const [result] = await this.db.insert(categories).values({
      name: entity.name,
      slug: entity.slug,
    }).returning();

    if (!result) {
      throw new DatabaseError("카테고리 생성에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 카테고리 업데이트
   */
  async update(entity: Category): Promise<Category> {
    const [result] = await this.db.update(categories)
      .set({
        name: entity.name,
        slug: entity.slug,
      })
      .where(eq(categories.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("카테고리 업데이트에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
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
      model.slug,
    );
  }
}
