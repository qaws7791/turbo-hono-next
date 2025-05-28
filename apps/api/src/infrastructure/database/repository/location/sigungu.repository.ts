import { asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { Sigungu } from '../../../domain/sigungu.entity';
import { sigungus } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ISigunguRepository } from './sigungu.repository.interface';

/**
 * 시군구 리포지토리 구현
 * Drizzle ORM을 사용하여 시군구 데이터에 접근합니다.
 */
@injectable()
export class SigunguRepository implements ISigunguRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 시군구 조회
   */
  async findById(id: number): Promise<Sigungu | null> {
    const result = await this.db.select().from(sigungus).where(eq(sigungus.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 이름으로 시군구 조회
   */
  async findByName(name: string): Promise<Sigungu | null> {
    const result = await this.db.select().from(sigungus).where(eq(sigungus.name, name)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 코드로 시군구 조회
   */
  async findByCode(code: string): Promise<Sigungu | null> {
    const result = await this.db.select().from(sigungus).where(eq(sigungus.code, code)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 시도 ID로 시군구 목록 조회
   */
  async findBySidoId(sidoId: number): Promise<Sigungu[]> {
    const result = await this.db.select().from(sigungus).where(eq(sigungus.sidoId, sidoId));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 시군구 조회
   */
  async findAll(filter?: Filter<Sigungu>, sort?: SortOptions<Sigungu>[]): Promise<Sigungu[]> {
    let query = this.db.select().from(sigungus);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(sigungus.id, filter.id));
      }
      if (filter.name !== undefined) {
        query = query.where(eq(sigungus.name, filter.name));
      }
      if (filter.code !== undefined) {
        query = query.where(eq(sigungus.code, filter.code));
      }
      if (filter.sidoId !== undefined) {
        query = query.where(eq(sigungus.sidoId, filter.sidoId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sigungus.id)) 
              : query.orderBy(asc(sigungus.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sigungus.name)) 
              : query.orderBy(asc(sigungus.name));
            break;
          case 'code':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sigungus.code)) 
              : query.orderBy(asc(sigungus.code));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      query = query.orderBy(asc(sigungus.name));
    }
    
    const result = await query;
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 시군구 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Sigungu>,
    sort?: SortOptions<Sigungu>[]
  ): Promise<PaginationResult<Sigungu>> {
    const { limit, cursor } = options;
    let query = this.db.select().from(sigungus);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(sigungus.id, filter.id));
      }
      if (filter.name !== undefined) {
        query = query.where(eq(sigungus.name, filter.name));
      }
      if (filter.code !== undefined) {
        query = query.where(eq(sigungus.code, filter.code));
      }
      if (filter.sidoId !== undefined) {
        query = query.where(eq(sigungus.sidoId, filter.sidoId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(sigungus.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sigungus.id)) 
              : query.orderBy(asc(sigungus.id));
            break;
          case 'name':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sigungus.name)) 
              : query.orderBy(asc(sigungus.name));
            break;
          case 'code':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(sigungus.code)) 
              : query.orderBy(asc(sigungus.code));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      query = query.orderBy(asc(sigungus.name));
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
   * 시군구 생성
   */
  async create(entity: Sigungu): Promise<Sigungu> {
    const result = await this.db.insert(sigungus).values({
      name: entity.name,
      code: entity.code,
      sidoId: entity.sidoId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 시군구 업데이트
   */
  async update(entity: Sigungu): Promise<Sigungu> {
    const result = await this.db.update(sigungus)
      .set({
        name: entity.name,
        code: entity.code,
        sidoId: entity.sidoId,
        updatedAt: entity.updatedAt,
      })
      .where(eq(sigungus.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * ID로 시군구 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(sigungus).where(eq(sigungus.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof sigungus.$inferSelect): Sigungu {
    return new Sigungu(
      model.id,
      model.name,
      model.code,
      model.sidoId,
      model.createdAt,
      model.updatedAt
    );
  }
}
