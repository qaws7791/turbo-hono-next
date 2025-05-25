import { DI_SYMBOLS } from "@/containers/di-symbols";
import { SidoRepository } from "@/infrastructure/database/repositories/sido.repository";
import { SigunguRepository } from "@/infrastructure/database/repositories/sigungu.repository";
import { inject, injectable } from "inversify";

@injectable()
export class RegionService {
  constructor(
    @inject(DI_SYMBOLS.sidoRepository)
    private sidoRepository: SidoRepository,
    @inject(DI_SYMBOLS.sigunguRepository)
    private sigunguRepository: SigunguRepository, // Assuming sigunguRepository is similar to sidoRepository
  ) {}

  async getAllSido() {
    return this.sidoRepository.findAll();
  }

  async getSigunguBySidoId(sidoId: number) {
    return this.sigunguRepository.findBySidoId(sidoId);
  }
}
