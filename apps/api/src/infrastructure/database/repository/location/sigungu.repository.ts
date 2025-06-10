import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { Sigungu } from '../../../../domain/entity/location.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { sigungu } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ISigunguRepository } from './sigungu.repository.interface';

/**
 * 시군구 리포지토리 구현
 * Drizzle ORM을 사용하여 시군구 데이터에 접근합니다.
 */
@injectable()
export class SigunguRepository implements ISigunguRepository {
  constructor(
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}
  findByNameInSido(sidoId: number, name: string): Promise<Sigungu | null> {
    throw new Error('Method not implemented.');
  }

  /**
   * ID로 시군구 조회
   */
  async findById(id: number): Promise<Sigungu | null> {
    const [result] = await this.db.select().from(sigungu).where(eq(sigungu.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 이름으로 시군구 조회
   */
  async findByName(name: string): Promise<Sigungu | null> {
    const [result] = await this.db.select().from(sigungu).where(eq(sigungu.name, name)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 시도 ID로 시군구 목록 조회
   */
  async findBySidoId(sidoId: number): Promise<Sigungu[]> {
    const result = await this.db.select().from(sigungu).where(eq(sigungu.sidoId, sidoId));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 시군구 조회
   */
  async findAll(filter?: Filter<Sigungu>, sort?: SortOptions<Sigungu>[]): Promise<Sigungu[]> {
    const query = this.db.select().from(sigungu);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(sigungu.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(sigungu.name, filter.name));
      }
      if (filter.sidoId !== undefined) {
        filterSQLs.push(eq(sigungu.sidoId, filter.sidoId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
           orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sigungu.id) 
              : asc(sigungu.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sigungu.name) 
              : asc(sigungu.name));
            break;
          case 'sidoId':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sigungu.sidoId) 
              : asc(sigungu.sidoId));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      orderSQLs.push(asc(sigungu.name));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(sigungu).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(sigungu.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(sigungu.name, filter.name));
      }
      if (filter.sidoId !== undefined) {
        filterSQLs.push(eq(sigungu.sidoId, filter.sidoId));
      }
    }

    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sigungu.id) 
              : asc(sigungu.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sigungu.name) 
              : asc(sigungu.name));
            break;
          case 'sidoId':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sigungu.sidoId) 
              : asc(sigungu.sidoId));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      orderSQLs.push(asc(sigungu.name));
    }

    const result = await query;
    
    // 결과 변환
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(sigungu).where(and(...filterSQLs));
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
   * 시군구 생성
   */
  async create(entity: Sigungu): Promise<Sigungu> {
    const [result] = await this.db.insert(sigungu).values({
      name: entity.name,
      sidoId: entity.sidoId,
    }).returning();

    if (!result) {
      throw new DatabaseError("시군구 생성에 실패했습니다.", status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 시군구 업데이트
   */
  async update(entity: Sigungu): Promise<Sigungu> {
    const [result] = await this.db.update(sigungu)
      .set({
        name: entity.name,
        sidoId: entity.sidoId,
      })
      .where(eq(sigungu.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("시군구 업데이트에 실패했습니다.", status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 시군구 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(sigungu).where(eq(sigungu.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof sigungu.$inferSelect): Sigungu {
    return new Sigungu(
      model.id,
      model.sidoId, 
      model.name,
    );
  }
}
