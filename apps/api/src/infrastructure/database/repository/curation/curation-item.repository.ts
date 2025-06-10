import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { CurationItemType } from '@/domain/entity/curation.types';
import { and, asc, count, desc, eq, inArray, SQL, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { CurationItem } from '../../../../domain/entity/curation.entity';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { curationItems } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ICurationItemRepository } from './curation-item.repository.interface';

/**
 * 큐레이션 아이템 리포지토리 구현
 * Drizzle ORM을 사용하여 큐레이션 아이템 데이터에 접근합니다.
 */
@injectable()
export class CurationItemRepository implements ICurationItemRepository {
  constructor(
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}
  /**
   * 여러 큐레이션 아이템을 한 번에 업데이트
   * @param items 업데이트할 큐레이션 아이템 배열
   * @returns 업데이트된 큐레이션 아이템 배열
   */
  async updateMany(items: CurationItem[]): Promise<CurationItem[]> {
    // 업데이트할 아이템이 없는 경우 빈 배열 반환
    if (items.length === 0) {
      return [];
    }

    // 업데이트할 아이템의 ID 목록 추출
    const ids = items.map(item => item.id).filter((id): id is number => id !== null);

    // 각 필드별로 CASE 문 생성
    // 위치(position) 필드 업데이트를 위한 CASE 문
    const positionSqlChunks = [];
    positionSqlChunks.push(sql`(case`);
    for (const item of items) {
      if (item.id !== null) {
        positionSqlChunks.push(sql`when ${curationItems.id} = ${item.id} then ${item.position}`);
      }
    }
    positionSqlChunks.push(sql`end)`);
    const positionSql = sql.join(positionSqlChunks, sql.raw(' '));

    // 스팟 ID 필드 업데이트를 위한 CASE 문
    const spotIdSqlChunks = [];
    spotIdSqlChunks.push(sql`(case`);
    for (const item of items) {
      if (item.id !== null) {
        spotIdSqlChunks.push(sql`when ${curationItems.id} = ${item.id} then ${item.spotId}`);
      }
    }
    spotIdSqlChunks.push(sql`end)`);
    const spotIdSql = sql.join(spotIdSqlChunks, sql.raw(' '));

    // 아이템 타입 필드 업데이트를 위한 CASE 문
    const itemTypeSqlChunks = [];
    itemTypeSqlChunks.push(sql`(case`);
    for (const item of items) {
      if (item.id !== null) {
        itemTypeSqlChunks.push(sql`when ${curationItems.id} = ${item.id} then ${item.itemType}`);
      }
    }
    itemTypeSqlChunks.push(sql`end)`);
    const itemTypeSql = sql.join(itemTypeSqlChunks, sql.raw(' '));

    // 크리에이터 ID 필드 업데이트를 위한 CASE 문
    const creatorIdSqlChunks = [];
    creatorIdSqlChunks.push(sql`(case`);
    for (const item of items) {
      if (item.id !== null) {
        creatorIdSqlChunks.push(sql`when ${curationItems.id} = ${item.id} then ${item.creatorId}`);
      }
    }
    creatorIdSqlChunks.push(sql`end)`);
    const creatorIdSql = sql.join(creatorIdSqlChunks, sql.raw(' '));

    // 스토리 ID 필드 업데이트를 위한 CASE 문
    const storyIdSqlChunks = [];
    storyIdSqlChunks.push(sql`(case`);
    for (const item of items) {
      if (item.id !== null) {
        storyIdSqlChunks.push(sql`when ${curationItems.id} = ${item.id} then ${item.storyId}`);
      }
    }
    storyIdSqlChunks.push(sql`end)`);
    const storyIdSql = sql.join(storyIdSqlChunks, sql.raw(' '));

    // 한 번의 쿼리로 모든 아이템 업데이트
    const result = await this.db.update(curationItems)
      .set({
        position: positionSql,
        spotId: spotIdSql,
        itemType: itemTypeSql,
        creatorId: creatorIdSql,
        storyId: storyIdSql
      })
      .where(inArray(curationItems.id, ids))
      .returning();

    // 업데이트된 결과를 도메인 엔티티로 변환하여 반환
    return result.map(item => this.mapToEntity(item));
  }

  /**
   * ID로 큐레이션 아이템 조회
   */
  async findById(id: number): Promise<CurationItem | null> {
    const [result] = await this.db.select().from(curationItems).where(eq(curationItems.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 큐레이션 스팟 ID로 큐레이션 아이템 목록 조회
   */
  async findBySpotId(spotId: number): Promise<CurationItem[]> {
    const result = await this.db.select().from(curationItems).where(eq(curationItems.spotId, spotId));
    return result.map(this.mapToEntity);
  }

  /**
   * 크리에이터 ID로 큐레이션 아이템 목록 조회
   */
  async findByCreatorId(creatorId: number): Promise<CurationItem[]> {
    const result = await this.db.select().from(curationItems).where(eq(curationItems.creatorId, creatorId));
    return result.map(this.mapToEntity);
  }

  /**
   * 스토리 ID로 큐레이션 아이템 목록 조회
   */
  async findByStoryId(storyId: number): Promise<CurationItem[]> {
    const result = await this.db.select().from(curationItems).where(eq(curationItems.storyId, storyId));
    return result.map(this.mapToEntity);
  }

  /**
   * 큐레이션 스팟 ID와 크리에이터 ID로 큐레이션 아이템 조회
   */
  async findBySpotIdAndCreatorId(spotId: number, creatorId: number): Promise<CurationItem | null> {
    const [result] = await this.db.select().from(curationItems)
      .where(and(
        eq(curationItems.spotId, spotId),
        eq(curationItems.creatorId, creatorId)
      ))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 큐레이션 스팟 ID와 스토리 ID로 큐레이션 아이템 조회
   */
  async findBySpotIdAndStoryId(spotId: number, storyId: number): Promise<CurationItem | null> {
    const [result] = await this.db.select().from(curationItems)
      .where(and(
        eq(curationItems.spotId, spotId),
        eq(curationItems.storyId, storyId)
      ))
      .limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 모든 큐레이션 아이템 조회
   */
  async findAll(filter?: Filter<CurationItem>, sort?: SortOptions<CurationItem>[]): Promise<CurationItem[]> {
    const query = this.db.select().from(curationItems);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(curationItems.id, filter.id));
      }
      if (filter.spotId !== undefined) {
        filterSQLs.push(eq(curationItems.spotId, filter.spotId));
      }
      if (filter.creatorId !== undefined && filter.creatorId !== null) {
        filterSQLs.push(eq(curationItems.creatorId, filter.creatorId));
      }
      if (filter.storyId !== undefined && filter.storyId !== null) {
        filterSQLs.push(eq(curationItems.storyId, filter.storyId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationItems.id) 
              : asc(curationItems.id));
            break;
          case "position":
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationItems.position) 
              : asc(curationItems.position));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationItems.createdAt) 
              : asc(curationItems.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 순서 오름차순
      orderSQLs.push(asc(curationItems.position));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 큐레이션 아이템 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<CurationItem>,
    sort?: SortOptions<CurationItem>[]
  ): Promise<PaginationResult<CurationItem>> {
    const { limit, page = 1 } = options;
    const query = this.db.select().from(curationItems).limit(limit).offset((page - 1) * limit);
    const filterSQLs: SQL[] = [];
    const orderSQLs: SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(curationItems.id, filter.id));
      }
      if (filter.spotId !== undefined) {
        filterSQLs.push(eq(curationItems.spotId, filter.spotId));
      }
      if (filter.creatorId !== undefined && filter.creatorId !== null) {
        filterSQLs.push(eq(curationItems.creatorId, filter.creatorId));
      }
      if (filter.storyId !== undefined && filter.storyId !== null) {
        filterSQLs.push(eq(curationItems.storyId, filter.storyId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationItems.id) 
              : asc(curationItems.id));
            break;
          case 'position':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationItems.position) 
              : asc(curationItems.position));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(curationItems.createdAt) 
              : asc(curationItems.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: 순서 오름차순
      orderSQLs.push(asc(curationItems.position));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    
    // 결과 변환
    const items = result.slice(0, limit).map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(curationItems).where(and(...filterSQLs));
    const totalCount = countResult?.totalCount || 0;
        
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
   * 큐레이션 아이템 생성
   */
  async create(entity: CurationItem): Promise<CurationItem> {
    const [result] = await this.db.insert(curationItems).values({
      spotId: entity.spotId,
      creatorId: entity.creatorId,
      storyId: entity.storyId,
      position: entity.position,
      createdAt: entity.createdAt,
      itemType: entity.itemType,
    }).returning();

    if (!result) {
      throw new DatabaseError("큐레이션 아이템 생성에 실패했습니다.", status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 큐레이션 아이템 업데이트
   */
  async update(entity: CurationItem): Promise<CurationItem> {
    const [result] = await this.db.update(curationItems)
      .set({
        spotId: entity.spotId,
        creatorId: entity.creatorId,
        storyId: entity.storyId,
        position: entity.position,  
        createdAt: entity.createdAt,
        itemType: entity.itemType,
      })
      .where(eq(curationItems.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("큐레이션 아이템 업데이트에 실패했습니다.", status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 큐레이션 아이템 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(curationItems).where(eq(curationItems.id, id)).returning();
    return result.length > 0;
  }

  /**
   * 큐레이션 스팟 ID로 큐레이션 아이템 삭제
   */
  async deleteBySpotId(spotId: number): Promise<boolean> {
    const result = await this.db.delete(curationItems).where(eq(curationItems.spotId, spotId)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof curationItems.$inferSelect): CurationItem {
    return new CurationItem(
      model.id,
      model.spotId,
      model.itemType as CurationItemType,
      model.creatorId,
      model.storyId,
      model.position,
      model.createdAt,
    );
  }
}
