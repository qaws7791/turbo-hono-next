import { HTTPError } from "@/common/errors/http-error";
import { DI_SYMBOLS } from "@/containers/di-symbols";
import { CreatorRepository } from "@/infrastructure/database/repositories/creator.repository";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class CreatorService {
  constructor(
    @inject(DI_SYMBOLS.creatorRepository)
    private creatorRepository: CreatorRepository,
  ) {}

  async applyCreator(
    userId: number,
    brandName: string,
    introduction: string,
    businessNumber: string,
    businessName: string,
    ownerName: string,
    sidoId: number,
    sigunguId: number,
    contactInfo: string,
    categoryId: number,
  ): Promise<void> {
    // 만약 이미 크리에이터로 등록되어 있는 경우 예외 처리
    const existingCreator = await this.creatorRepository.findByUserId(userId);
    if (existingCreator) {
      throw new HTTPError(
        {
          message: "이미 크리에이터로 등록되어 있습니다.",
        },
        status.BAD_REQUEST,
      );
    }
    // 크리에이터 신청 정보 저장
    await this.creatorRepository.create({
      userId,
      brandName,
      introduction,
      businessNumber,
      businessName,
      ownerName,
      sidoId,
      sigunguId,
      contactInfo,
      categoryId,
    });
  }

  async getMyCreatorProfile(userId: number) {
    // 사용자 ID로 크리에이터 프로필 조회
    const profile = await this.creatorRepository.findByUserId(userId);
    if (!profile) {
      throw new HTTPError(
        {
          message: "크리에이터 프로필이 없습니다.",
        },
        status.NOT_FOUND,
      );
    }
    return profile;
  }

  async followCreator(userId: number, creatorId: number) {
    
  }

  async unfollowCreator(userId: number, creatorId: number) {
    
  }
}
