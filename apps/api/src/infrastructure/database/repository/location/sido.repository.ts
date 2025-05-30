import { DatabaseError } from '@/common/errors/database-error';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { Sido } from '../../../../domain/entity/location.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { sido } from '../../schema';
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
  findByCode(code: string): Promise<Sido | null> {
    throw new Error('Method not implemented.');
  }

  /**
   * ID로 시도 조회
   */
  async findById(id: number): Promise<Sido | null> {
    const [result] = await this.db.select().from(sido).where(eq(sido.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 이름으로 시도 조회
   */
  async findByName(name: string): Promise<Sido | null> {
    const [result] = await this.db.select().from(sido).where(eq(sido.name, name)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 모든 시도 조회
   */
  async findAll(filter?: Filter<Sido>, sort?: SortOptions<Sido>[]): Promise<Sido[]> {
    const query = this.db.select().from(sido);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(sido.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(sido.name, filter.name));
      }
      }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sido.id) 
              : asc(sido.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sido.name) 
              : asc(sido.name));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      orderSQLs.push(asc(sido.name));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
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
    const { limit, page = 1 } = options;
    const query = this.db.select().from(sido).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(sido.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(sido.name, filter.name));
      }

    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sido.id) 
              : asc(sido.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(sido.name) 
              : asc(sido.name));
            break;
        }
      }
    } else {
      // 기본 정렬: 이름 오름차순
      orderSQLs.push(asc(sido.name));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    
    // 결과 변환
    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(sido).where(and(...filterSQLs));
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
   * 시도 생성
   */
  async create(entity: Sido): Promise<Sido> {
    const [result] = await this.db.insert(sido).values({
      name: entity.name,
    }).returning();

    if (!result) {
      throw new DatabaseError('시도 생성 실패', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 시도 업데이트
   */
  async update(entity: Sido): Promise<Sido> {
    const [result] = await this.db.update(sido)
      .set({
        name: entity.name,
      })
      .where(eq(sido.id, entity.id))
      .returning();

    if (!result) {
      throw new DatabaseError('시도 업데이트 실패', status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 시도 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(sido).where(eq(sido.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof sido.$inferSelect): Sido {
    return new Sido(
      model.id,
      model.name,
    );
  }
}
