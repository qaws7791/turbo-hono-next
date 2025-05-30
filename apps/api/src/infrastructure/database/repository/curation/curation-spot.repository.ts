import { DatabaseError } from '@/common/errors/database-error';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { CurationSpot } from '../../../../domain/entity/curation.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { curationSpots } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ICurationSpotRepository } from './curation-spot.repository.interface';

/**
 * 큐레이션 스팟 리포지토리 구현
 * Drizzle ORM을 사용하여 큐레이션 스팟 데이터에 접근합니다.
 */
@injectable()
export class CurationSpotRepository implements ICurationSpotRepository {
  constructor(
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}
  async findByName(name: string): Promise<CurationSpot | null> {
    const [result] = await this.db.select().from(curationSpots).where(eq(curationSpots.name, name)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }
  async findBySlug(slug: string): Promise<CurationSpot | null> {
    const [result] = await this.db.select().from(curationSpots).where(eq(curationSpots.slug, slug)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 큐레이션 스팟 조회
   */
  async findById(id: number): Promise<CurationSpot | null> {
    const [result] = await this.db.select().from(curationSpots).where(eq(curationSpots.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 모든 큐레이션 스팟 조회
   */
  async findAll(filter?: Filter<CurationSpot>, sort?: SortOptions<CurationSpot>[]): Promise<CurationSpot[]> {
    const query = this.db.select().from(curationSpots);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(curationSpots.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(curationSpots.name, filter.name));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationSpots.id) 
              : asc(curationSpots.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationSpots.name) 
              : asc(curationSpots.name));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationSpots.createdAt) 
              : asc(curationSpots.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(curationSpots.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 큐레이션 스팟 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<CurationSpot>,
    sort?: SortOptions<CurationSpot>[]
  ): Promise<PaginationResult<CurationSpot>> {
    const { limit, page = 1} = options;
    const query = this.db.select().from(curationSpots).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(curationSpots.id, filter.id));
      }
      if (filter.name !== undefined) {
        filterSQLs.push(eq(curationSpots.name, filter.name));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationSpots.id) 
              : asc(curationSpots.id));
            break;
          case 'name':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationSpots.name) 
              : asc(curationSpots.name));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationSpots.createdAt) 
              : asc(curationSpots.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(curationSpots.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);

    const items = result.map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(curationSpots).where(and(...filterSQLs));
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
   * 큐레이션 스팟 생성
   */
  async create(entity: CurationSpot): Promise<CurationSpot> {
    const [result] = await this.db.insert(curationSpots).values({
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      coverImageUrl: entity.coverImageUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    if (!result) {
      throw new DatabaseError("큐레이션 스팟 생성에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 큐레이션 스팟 업데이트
   */
  async update(entity: CurationSpot): Promise<CurationSpot> {
    const [result] = await this.db.update(curationSpots)
      .set({
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        coverImageUrl: entity.coverImageUrl,
        updatedAt: entity.updatedAt,
      })
      .where(eq(curationSpots.id, entity.id))
        .returning();
        
    if (!result) {
      throw new DatabaseError("큐레이션 스팟 업데이트에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
      
    return this.mapToEntity(result);
  }

  /**
   * ID로 큐레이션 스팟 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(curationSpots).where(eq(curationSpots.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof curationSpots.$inferSelect): CurationSpot {
    return new CurationSpot(
      model.id,
      model.name,
      model.slug,
      model.description,
      model.coverImageUrl,
      model.createdAt,
      model.updatedAt
    );
  }
}
