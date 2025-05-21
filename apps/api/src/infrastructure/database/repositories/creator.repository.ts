import { DatabaseError } from "@/common/errors/database-error";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import {
  type CreatorInsert,
  type CreatorSelect,
  type DbClient,
} from "@/infrastructure/database/types";
import { and, eq } from "drizzle-orm";
import status from "http-status";
import { inject, injectable } from "inversify";
import { creatorCategories, creators } from "../schema";

@injectable()
export class CreatorRepository {
  constructor(
    @inject(DI_SYMBOLS.db)
    private db: DbClient,
  ) {}

  /**
   * 1. 로컬 크리에이터 신청
   */
  async applyCreator(data: CreatorInsert): Promise<CreatorSelect> {
    const [creator] = await this.db.insert(creators).values(data).returning();
    if (!creator) {
      throw new DatabaseError(
        "크리에이터 신청에 실패했습니다.",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return creator;
  }

  /**
   * 2. 내 크리에이터 프로필 정보 조회 (userId)
   */
  async getMyCreatorProfile(
    userId: number,
  ): Promise<CreatorSelect | undefined> {
    return this.db.query.creators.findFirst({
      where: eq(creators.userId, userId),
      with: {
        user: true,
        creatorCategories: { with: { category: true } },
      },
    });
  }

  /**
   * 3. 내 크리에이터 프로필/스토어 정보 수정 (userId)
   */
  async updateMyCreatorProfile(
    userId: number,
    updateData: Partial<CreatorInsert>,
  ): Promise<CreatorSelect> {
    const [creator] = await this.db
      .update(creators)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(creators.userId, userId))
      .returning();
    if (!creator) {
      throw new DatabaseError(
        "크리에이터 정보 수정에 실패했습니다.",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return creator;
  }

  /**
   * 4. 크리에이터 목록 조회 (region/category filter, 페이징)
   * 카테고리 필터가 있을 경우 반환 타입은
   * { creators: CreatorSelect, creator_categories: { ... } | null }[] 입니다.
   */
  async getCreatorsList({
    regionId,
    categoryId,
    limit = 20,
    offset = 0,
  }: {
    regionId?: number;
    categoryId?: number;
    limit?: number;
    offset?: number;
  }): Promise<CreatorSelect[]> {
    if (categoryId) {
      // 카테고리 필터가 있으면 조인 필요
      // 반환 타입: { creators: CreatorSelect, creator_categories: { ... } | null }[]
      // (프론트에서 creators만 추출해서 사용해야 함)
      return this.db
        .select()
        .from(creators)
        .leftJoin(
          creatorCategories,
          eq(creators.id, creatorCategories.creatorId),
        )
        .where(
          and(
            regionId ? eq(creators.regionId, regionId) : undefined,
            eq(creatorCategories.categoryId, categoryId),
          ),
        )
        .limit(limit)
        .offset(offset) as any;
    }
    // 지역만 필터
    return this.db.query.creators.findMany({
      where: regionId ? eq(creators.regionId, regionId) : undefined,
      with: {
        user: true,
        creatorCategories: { with: { category: true } },
      },
      limit,
      offset,
    });
  }

  /**
   * 5. 크리에이터 상세조회 (id 또는 brandName)
   */
  async getCreatorDetail({
    id,
    brandName,
  }: {
    id?: number;
    brandName?: string;
  }): Promise<CreatorSelect | undefined> {
    return this.db.query.creators.findFirst({
      where: id
        ? eq(creators.id, id)
        : brandName
          ? eq(creators.brandName, brandName)
          : undefined,
      with: {
        user: true,
        creatorCategories: { with: { category: true } },
      },
    });
  }
}
