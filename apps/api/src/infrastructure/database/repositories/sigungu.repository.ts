import { DI_SYMBOLS } from "@/containers/di-symbols";
import { type DbClient } from "@/infrastructure/database/types";
import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";

@injectable()
export class SigunguRepository {
  constructor(
    @inject(DI_SYMBOLS.db)
    private db: DbClient,
  ) {}

  findAll() {
    return this.db.query.sigungu.findMany();
  }

  findBySidoId(sidoId: number) {
    return this.db.query.sigungu.findMany({
      where: (sigungu) => eq(sigungu.sidoId, sidoId),
    });
  }
}
