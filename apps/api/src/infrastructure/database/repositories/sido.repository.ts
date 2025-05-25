import { DI_SYMBOLS } from "@/containers/di-symbols";
import { type DbClient } from "@/infrastructure/database/types";
import { inject, injectable } from "inversify";

@injectable()
export class SidoRepository {
  constructor(
    @inject(DI_SYMBOLS.db)
    private db: DbClient,
  ) {}

  findAll() {
    return this.db.query.sido.findMany();
  }
}
