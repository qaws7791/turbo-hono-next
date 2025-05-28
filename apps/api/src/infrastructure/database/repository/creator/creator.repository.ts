import { asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
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
    @inject('Database')
    private db: PostgresJsDatabase
  ) {}

  /**
   * ID로 크리에이터 조회
   */
  async findById(id: number): Promise<Creator | null> {
    const result = await this.db.select().from(creators).where(eq(creators.id, id)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 사용자 ID로 크리에이터 조회
   */
  async findByUserId(userId: number): Promise<Creator | null> {
    const result = await this.db.select().from(creators).where(eq(creators.userId, userId)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 브랜드명으로 크리에이터 조회
   */
  async findByBrandName(brandName: string): Promise<Creator | null> {
    const result = await this.db.select().from(creators).where(eq(creators.brandName, brandName)).limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapToEntity(result[0]);
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
    let query = this.db.select().from(creators);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(creators.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(creators.userId, filter.userId));
      }
      if (filter.status !== undefined) {
        query = query.where(eq(creators.applicationStatus, filter.status));
      }
      if (filter.categoryId !== undefined) {
        query = query.where(eq(creators.categoryId, filter.categoryId));
      }
      if (filter.sidoId !== undefined) {
        query = query.where(eq(creators.sidoId, filter.sidoId));
      }
      if (filter.sigunguId !== undefined) {
        query = query.where(eq(creators.sigunguId, filter.sigunguId));
      }
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(creators.id)) 
              : query.orderBy(asc(creators.id));
            break;
          case 'brandName':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(creators.brandName)) 
              : query.orderBy(asc(creators.brandName));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(creators.createdAt)) 
              : query.orderBy(asc(creators.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(creators.id));
    }
    
    const result = await query;
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
    const { limit, cursor } = options;
    let query = this.db.select().from(creators);
    
    // 필터 적용
    if (filter) {
      if (filter.id !== undefined) {
        query = query.where(eq(creators.id, filter.id));
      }
      if (filter.userId !== undefined) {
        query = query.where(eq(creators.userId, filter.userId));
      }
      if (filter.status !== undefined) {
        query = query.where(eq(creators.applicationStatus, filter.status));
      }
      if (filter.categoryId !== undefined) {
        query = query.where(eq(creators.categoryId, filter.categoryId));
      }
      if (filter.sidoId !== undefined) {
        query = query.where(eq(creators.sidoId, filter.sidoId));
      }
      if (filter.sigunguId !== undefined) {
        query = query.where(eq(creators.sigunguId, filter.sigunguId));
      }
    }
    
    // 커서 기반 페이지네이션
    if (cursor) {
      query = query.where(creators.id > Number(cursor));
    }
    
    // 정렬 적용
    if (sort && sort.length > 0) {
      for (const sortOption of sort) {
        switch (sortOption.field) {
          case 'id':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(creators.id)) 
              : query.orderBy(asc(creators.id));
            break;
          case 'brandName':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(creators.brandName)) 
              : query.orderBy(asc(creators.brandName));
            break;
          case 'createdAt':
            query = sortOption.order === 'desc' 
              ? query.orderBy(desc(creators.createdAt)) 
              : query.orderBy(asc(creators.createdAt));
            break;
        }
      }
    } else {
      // 기본 정렬: ID 오름차순
      query = query.orderBy(asc(creators.id));
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
   * 크리에이터 생성
   */
  async create(entity: Creator): Promise<Creator> {
    const result = await this.db.insert(creators).values({
      userId: entity.userId,
      brandName: entity.brandName,
      bio: entity.bio,
      profileImageUrl: entity.profileImageUrl,
      coverImageUrl: entity.coverImageUrl,
      sidoId: entity.sidoId,
      sigunguId: entity.sigunguId,
      categoryId: entity.categoryId,
      applicationStatus: entity.status,
      approvedAt: entity.approvedAt,
      rejectedAt: entity.rejectedAt,
      rejectionReason: entity.rejectionReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }).returning();
    
    return this.mapToEntity(result[0]);
  }

  /**
   * 크리에이터 업데이트
   */
  async update(entity: Creator): Promise<Creator> {
    const result = await this.db.update(creators)
      .set({
        brandName: entity.brandName,
        bio: entity.bio,
        profileImageUrl: entity.profileImageUrl,
        coverImageUrl: entity.coverImageUrl,
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
    
    return this.mapToEntity(result[0]);
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
      model.bio,
      model.profileImageUrl,
      model.coverImageUrl,
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
