import { DatabaseError } from "@/common/errors/database-error";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import {
  type CreatorInsert,
  type CreatorSelect,
  type DbClient,
} from "@/infrastructure/database/types";
import { eq } from "drizzle-orm";
import status from "http-status";
import { inject, injectable } from "inversify";
import { creators } from "../schema";
@injectable()
export class CreatorRepository {
  constructor(
    @inject(DI_SYMBOLS.db)
    private db: DbClient,
  ) {}

  async create(data: CreatorInsert): Promise<CreatorSelect> {
    const [creator] = await this.db.insert(creators).values(data).returning();
    if (!creator) {
      throw new DatabaseError(
        "크리에이터 생성에 실패했습니다.",
        status.INTERNAL_SERVER_ERROR,
      );
    }
    return creator;
  }

  findByUserId(userId: number): Promise<CreatorSelect | undefined> {
    return this.db.query.creators.findFirst({
      where: eq(creators.userId, userId),
    });
  }
}
