import { asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inject, injectable } from 'inversify';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { CurationSpot } from '../../../domain/curation-spot.entity';
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

  /**
   * ID로 큐레이션 스팟 조회
   */
  async findById(id: number): Promise<CurationSpot | null> {
    const result = await this.db.select().from(curationSpots).where(eq(curationSpots.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 제목으로 큐레이션 스팟 조회
   */
  async findByTitle(title: string): Promise<CurationSpot | null> {
    const result = await this.db.select().from(curationSpots).where(eq(curationSpots.title, title)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 활성화된 큐레이션 스팟 목록 조회
   */
  async findActive(): Promise<CurationSpot[]> {
    const result = await this.db.select().from(curationSpots).where(eq(curationSpots.isActive, true));
    return result.map(this.mapToEntity);
  }

  /**
   * 비활성화된 큐레이션 스팟 목록 조회
   */
  async findInactive(): Promise<CurationSpot[]> {
    const result = await this.db.select().from(curationSpots).where(eq(curationSpots.isActive, false));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 큐레이션 스팟 조회
   */
  async findAll(filter?: Filter<CurationSpot>, sort?: SortOptions<CurationSpot>[]): Promise<CurationSpot[]> {
    let query = this.db.select().from(curationSpots);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(curationSpots.id, filter.id));
      }
      if (filter.title !== undefined) {
        query = query.where(eq(curationSpots.title, filter.title));
      }
      if (filter.isActive !== undefined) {
        query = query.where(eq(curationSpots.isActive, filter.isActive));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.id)) 
              : query.orderBy(asc(curationSpots.id));
            break;
          case 'title':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.title)) 
              : query.orderBy(asc(curationSpots.title));
            break;
          case 'order':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.order)) 
              : query.orderBy(asc(curationSpots.order));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.createdAt)) 
              : query.orderBy(asc(curationSpots.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 순서 오름차순
      query = query.orderBy(asc(curationSpots.order));
    }
    
    const result = await query;
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
    const { limit, cursor } = options;
    let query = this.db.select().from(curationSpots);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(curationSpots.id, filter.id));
      }
      if (filter.title !== undefined) {
        query = query.where(eq(curationSpots.title, filter.title));
      }
      if (filter.isActive !== undefined) {
        query = query.where(eq(curationSpots.isActive, filter.isActive));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(curationSpots.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.id)) 
              : query.orderBy(asc(curationSpots.id));
            break;
          case 'title':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.title)) 
              : query.orderBy(asc(curationSpots.title));
            break;
          case 'order':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.order)) 
              : query.orderBy(asc(curationSpots.order));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(curationSpots.createdAt)) 
              : query.orderBy(asc(curationSpots.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 순서 오름차순
      query = query.orderBy(asc(curationSpots.order));
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
   * 큐레이션 스팟 생성
   */
  async create(entity: CurationSpot): Promise<CurationSpot> {
    const result = await this.db.insert(curationSpots).values({
      title: entity.title,
      description: entity.description,
      thumbnailUrl: entity.thumbnailUrl,
      isActive: entity.isActive,
      order: entity.order,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 큐레이션 스팟 업데이트
   */
  async update(entity: CurationSpot): Promise<CurationSpot> {
    const result = await this.db.update(curationSpots)
      .set({
        title: entity.title,
        description: entity.description,
        thumbnailUrl: entity.thumbnailUrl,
        isActive: entity.isActive,
        order: entity.order,
        updatedAt: entity.updatedAt,
      })
      .where(eq(curationSpots.id, entity.id))
      .returning();
    
    return this.mapToEntity(result[0]);
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
      model.title,
      model.description,
      model.thumbnailUrl,
      model.isActive,
      model.order,
      model.createdAt,
      model.updatedAt
    );
  }
}
