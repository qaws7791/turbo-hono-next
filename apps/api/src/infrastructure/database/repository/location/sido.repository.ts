import { asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { Sido } from '../../../domain/sido.entity';
import { sidos } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ISidoRepository } from './sido.repository.interface';

/**
 * 시도 리포지토리 구현
 * Drizzle ORM을 사용하여 시도 데이터에 접근합니다.
 */
@injectable()
export class SidoRepository implements ISidoRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 시도 조회
   */
  async findById(id: number): Promise<Sido | null> {
    const result = await this.db.select().from(sidos).where(eq(sidos.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 이름으로 시도 조회
   */
  async findByName(name: string): Promise<Sido | null> {
    const result = await this.db.select().from(sidos).where(eq(sidos.name, name)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 코드로 시도 조회
   */
  async findByCode(code: string): Promise<Sido | null> {
    const result = await this.db.select().from(sidos).where(eq(sidos.code, code)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 모든 시도 조회
   */
  async findAll(filter?: Filter<Sido>, sort?: SortOptions<Sido>[]): Promise<Sido[]> {
    let query = this.db.select().from(sidos);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(sidos.id, filter.id));
      }
      if (filter.name !== undefined) {
        query = query.where(eq(sidos.name, filter.name));
      }
      if (filter.code !== undefined) {
        query = query.where(eq(sidos.code, filter.code));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sidos.id)) 
              : query.orderBy(asc(sidos.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sidos.name)) 
              : query.orderBy(asc(sidos.name));
            break;
          case 'code':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sidos.code)) 
              : query.orderBy(asc(sidos.code));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      query = query.orderBy(asc(sidos.name));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 시도 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Sido>,
    sort?: SortOptions<Sido>[]
  ): Promise<PaginationResult<Sido>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(sidos);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(sidos.id, filter.id));
      }
      if (filter.name !== undefined) {
        query = query.where(eq(sidos.name, filter.name));
      }
      if (filter.code !== undefined) {
        query = query.where(eq(sidos.code, filter.code));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(sidos.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sidos.id)) 
              : query.orderBy(asc(sidos.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sidos.name)) 
              : query.orderBy(asc(sidos.name));
            break;
          case 'code':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sidos.code)) 
              : query.orderBy(asc(sidos.code));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      query = query.orderBy(asc(sidos.name));
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
   * 시도 생성
   */
  async create(entity: Sido): Promise<Sido> {
    const result = await this.db.insert(sidos).values({
      name: entity.name,
      code: entity.code,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 시도 업데이트
   */
  async update(entity: Sido): Promise<Sido> {
    const result = await this.db.update(sidos)
      .set({
        name: entity.name,
        code: entity.code,
        updatedAt: entity.updatedAt,
      })
      .where(eq(sidos.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 시도 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(sidos).where(eq(sidos.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof sidos.$inferSelect): Sido {
    return new Sido(
      model.id,
      model.name,
      model.code,
      model.createdAt,
      model.updatedAt
    );
  }
}
