import { and, eq } from "drizzle-orm";

import { DatabaseError } from "@/common/errors/database-error";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import {
  type DbClient,
  type ObjectInsert,
  type ObjectSelect,
} from "@/infrastructure/database/types";
import status from "http-status";
import { inject, injectable } from "inversify";
import { objects } from "../schema";

@injectable()
export class ObjectRepository {
  constructor(
    @inject(DI_SYMBOLS.db)
    private db: DbClient,
  ) {}

  /**
   * 새로운 객체 업로드 요청을 생성합니다.
   */
  async createObject(data: ObjectInsert): Promise<ObjectSelect> {
    const [object] = await this.db.insert(objects).values(data).returning();
    if (!object) {
      throw new DatabaseError(
        "Object creation failed",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return object;
  }

  /**
   * 객체 업로드 완료 상태를 업데이트합니다.
   */
  async markAsUploaded(id: number): Promise<ObjectSelect> {
    const [object] = await this.db
      .update(objects)
      .set({
        isUploaded: true,
        updatedAt: new Date(),
      })
      .where(eq(objects.id, id))
      .returning();
    if (!object) {
      throw new DatabaseError(
        "Object update failed",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return object;
  }

  /**
   * ID로 객체를 조회합니다.
   */
  async findById(id: number): Promise<ObjectSelect | undefined> {
    const [object] = await this.db
      .select()
      .from(objects)
      .where(eq(objects.id, id));
    return object;
  }

  /**
   * 버킷과 키로 객체를 조회합니다.
   */
  async findByBucketAndKey(
    bucket: string,
    key: string,
  ): Promise<ObjectSelect | undefined> {
    const [object] = await this.db
      .select()
      .from(objects)
      .where(and(eq(objects.bucket, bucket), eq(objects.key, key)));

    return object;
  }

  /**
   * 사용자의 업로드된 객체 목록을 조회합니다.
   */
  async findByUserId(userId: number): Promise<ObjectSelect[]> {
    const query = await this.db
      .select()
      .from(objects)
      .where(eq(objects.userId, userId));

    return query;
  }

  /**
   * 객체를 삭제합니다.
   */
  async delete(id: number): Promise<ObjectSelect | undefined> {
    const [object] = await this.db
      .delete(objects)
      .where(eq(objects.id, id))
      .returning();
    return object;
  }

  /**
   * 객체의 메타데이터를 업데이트합니다.
   */
  async updateMetadata(
    id: number,
    metadata: Partial<Pick<ObjectSelect, "customMetadata" | "contentType">>,
  ): Promise<ObjectSelect | undefined> {
    const [object] = await this.db
      .update(objects)
      .set({
        ...metadata,
        updatedAt: new Date(),
      })
      .where(eq(objects.id, id))
      .returning();
    return object;
  }

  /**
   * 업로드되지 않은 오래된 객체를 조회합니다.
   * (예: 24시간 이상 업로드되지 않은 객체)
   */
  async findStaleObjects(olderThan: Date): Promise<ObjectSelect[]> {
    return this.db
      .select()
      .from(objects)
      .where(
        and(eq(objects.isUploaded, false), eq(objects.createdAt, olderThan)),
      );
  }
}
