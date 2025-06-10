import { DatabaseError } from '@/common/errors/database-error';
import { DI_SYMBOLS } from '@/containers/di-symbols';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import status from 'http-status';
import { inject, injectable } from 'inversify';
import { Creator } from '../../../../domain/entity/creator.entity';
import { CreatorStatus } from '../../../../domain/entity/creator.types';
import { PaginationOptions, PaginationResult } from '../../../../domain/service/service.types';
import { creators } from '../../schema';
import { Filter, SortOptions } from '../repository.types';
import { ICreatorRepository } from './creator.repository.interface';

/**
 * 크리에이터 리포지토리 구현
 * Drizzle ORM을 사용하여 크리에이터 데이터에 접근합니다.
 */
@injectable()
export class CreatorRepository implements ICreatorRepository {
  constructor(
    @inject(DI_SYMBOLS.DB)
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 크리에이터 조회
   */
  async findById(id: number): Promise<Creator | null> {
    const [result] = await this.db.select().from(creators).where(eq(creators.id, id)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 사용자 ID로 크리에이터 조회
   */
  async findByUserId(userId: number): Promise<Creator | null> {
    const [result] = await this.db.select().from(creators).where(eq(creators.userId, userId)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 브랜드명으로 크리에이터 조회
   */
  async findByBrandName(brandName: string): Promise<Creator | null> {
    const [result] = await this.db.select().from(creators).where(eq(creators.brandName, brandName)).limit(1);
    
    if (!result) {
      return null;
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 상태로 크리에이터 목록 조회
   */
  async findByStatus(status: CreatorStatus): Promise<Creator[]> {
    const result = await this.db.select().from(creators).where(eq(creators.applicationStatus, status));
    return result.map(this.mapToEntity);
  }

  /**
   * 카테고리 ID로 크리에이터 목록 조회
   */
  async findByCategoryId(categoryId: number): Promise<Creator[]> {
    const result = await this.db.select().from(creators).where(eq(creators.categoryId, categoryId));
    return result.map(this.mapToEntity);
  }

  /**
   * 시도 ID로 크리에이터 목록 조회
   */
  async findBySidoId(sidoId: number): Promise<Creator[]> {
    const result = await this.db.select().from(creators).where(eq(creators.sidoId, sidoId));
    return result.map(this.mapToEntity);
  }

  /**
   * 시군구 ID로 크리에이터 목록 조회
   */
  async findBySigunguId(sigunguId: number): Promise<Creator[]> {
    const result = await this.db.select().from(creators).where(eq(creators.sigunguId, sigunguId));
    return result.map(this.mapToEntity);
  }

  /**
   * 모든 크리에이터 조회
   */
  async findAll(filter?: Filter<Creator>, sort?: SortOptions<Creator>[]): Promise<Creator[]> {
    const query = this.db.select().from(creators);
    const filterSQLs:SQL[] = [];
    const orderSQLs:SQL[] = [];
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(creators.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(creators.userId, filter.userId));
      }
      if (filter.status !== undefined) {
        filterSQLs.push(eq(creators.applicationStatus, filter.status));
      }
      if (filter.categoryId !== undefined && filter.categoryId !== null) {
        filterSQLs.push(eq(creators.categoryId, filter.categoryId));
      }
      if (filter.sidoId !== undefined && filter.sidoId !== null) {
        filterSQLs.push(eq(creators.sidoId, filter.sidoId));
      }
      if (filter.sigunguId !== undefined && filter.sigunguId !== null) {
        filterSQLs.push(eq(creators.sigunguId, filter.sigunguId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(creators.id) 
              : asc(creators.id));
            break;
          case 'brandName':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(creators.brandName) 
              : asc(creators.brandName));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(creators.createdAt) 
              : asc(creators.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(creators.id));
    }
    
    const result = await query.where(and(...filterSQLs)).orderBy(...orderSQLs);
    return result.map(this.mapToEntity);
  }

  /**
   * 페이지네이션을 적용하여 크리에이터 조회
   */
  async findWithPagination(
    options: PaginationOptions,
    filter?: Filter<Creator>,
    sort?: SortOptions<Creator>[]
  ): Promise<PaginationResult<Creator>> {
    const { limit, page = 1 } = options;
    const query = this.db.select().from(creators).limit(limit).offset((page - 1) * limit);
    const filterSQLs:SQL[] = [];
    const orderSQLs:SQL[] = [];
    
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        filterSQLs.push(eq(creators.id, filter.id));
      }
      if (filter.userId !== undefined) {
        filterSQLs.push(eq(creators.userId, filter.userId));
      }
      if (filter.status !== undefined) {
        filterSQLs.push(eq(creators.applicationStatus, filter.status));
      }
      if (filter.categoryId !== undefined && filter.categoryId !== null) {
        filterSQLs.push(eq(creators.categoryId, filter.categoryId));
      }
      if (filter.sidoId !== undefined && filter.sidoId !== null) {
        filterSQLs.push(eq(creators.sidoId, filter.sidoId));
      }
      if (filter.sigunguId !== undefined && filter.sigunguId !== null) {
        filterSQLs.push(eq(creators.sigunguId, filter.sigunguId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(creators.id) 
              : asc(creators.id));
            break;
          case 'brandName':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(creators.brandName) 
              : asc(creators.brandName));
            break;
          case 'createdAt':
            orderSQLs.push(sortOption.order === 'desc' 
              ? desc(creators.createdAt) 
              : asc(creators.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      orderSQLs.push(asc(creators.id));
    }
    
    const result = await query;
    
    // 결과 변환
    const items = result.slice(0, limit).map(this.mapToEntity);
    const [countResult] = await this.db.select({ totalCount: count() }).from(creators).where(and(...filterSQLs));
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
   * 크리에이터 생성
   */
  async create(entity: Creator): Promise<Creator> {
    // 스키마에 정의된 필드만 사용하여 insert 수행

    const data: typeof creators.$inferInsert = {
      userId: entity.userId,
      brandName: entity.brandName,
      introduction: entity.introduction || '',
      businessNumber: entity.businessNumber,
      businessName: entity.businessName,
      ownerName: entity.ownerName,
      sidoId: entity.sidoId,
      sigunguId: entity.sigunguId,
      categoryId: entity.categoryId,
      contactInfo: entity.contactInfo,
      applicationStatus: entity.status,
      approvedAt: entity.approvedAt,
      rejectedAt: entity.rejectedAt,
      rejectionReason: entity.rejectionReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    const [result] = await this.db.insert(creators).values(data).returning();

    if (!result) {
      throw new DatabaseError("크리에이터 생성에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * 크리에이터 업데이트
   */
  async update(entity: Creator): Promise<Creator> {
    const [result] = await this.db.update(creators)
      .set({
        brandName: entity.brandName,
        introduction: entity.introduction,
        businessNumber: entity.businessNumber,
        businessName: entity.businessName,
        ownerName: entity.ownerName,
        sidoId: entity.sidoId,
        sigunguId: entity.sigunguId,
        categoryId: entity.categoryId,
        applicationStatus: entity.status,
        approvedAt: entity.approvedAt,
        rejectedAt: entity.rejectedAt,
        rejectionReason: entity.rejectionReason,
        updatedAt: entity.updatedAt,
      })
      .where(eq(creators.id, entity.id))
      .returning();
    
    if (!result) {
      throw new DatabaseError("크리에이터 업데이트에 실패했습니다.",status.INTERNAL_SERVER_ERROR);
    }
    
    return this.mapToEntity(result);
  }

  /**
   * ID로 크리에이터 삭제
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.db.delete(creators).where(eq(creators.id, id)).returning();
    return result.length > 0;
  }

  /**
   * DB 모델을 도메인 엔티티로 변환
   */
  private mapToEntity(model: typeof creators.$inferSelect): Creator {
    return new Creator(
      model.id,
      model.userId,
      model.brandName,
      model.introduction,
      model.businessNumber,
      model.businessName,
      model.ownerName,
      model.contactInfo,
      model.sidoId,
      model.sigunguId,
      model.categoryId,
      model.applicationStatus as CreatorStatus,
      model.approvedAt,
      model.rejectedAt,
      model.rejectionReason,
      model.createdAt,
      model.updatedAt
    );
  }
}
