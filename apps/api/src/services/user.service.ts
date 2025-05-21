import { DI_SYMBOLS } from "@/containers/symbols";
import { UserRepository } from "@/db/repositories/user.repository";
import { users } from "@/db/schema";
import { DatabaseError } from "@/errors/database-error";
import status from "http-status";
import { inject, injectable } from "inversify";

@injectable()
export class UserService {
  constructor(
    @inject(DI_SYMBOLS.userRepository)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * 내 정보 조회
   */
  async getMyInfo(
    userId: number,
  ): Promise<typeof users.$inferSelect | undefined> {
    return this.userRepository.findUserById(userId);
  }

  /**
   * 내 정보 수정 (name, profileImageUrl만 변경 가능)
   */
  async updateMyInfo(
    userId: number,
    data: { name?: string; profileImageUrl?: string },
  ): Promise<void> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new DatabaseError("존재하지 않는 사용자입니다.", status.NOT_FOUND);
    }
    const updateData: Partial<typeof users.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.profileImageUrl !== undefined)
      updateData.profileImageUrl = data.profileImageUrl;
    if (Object.keys(updateData).length === 0) return;
    await this.userRepository.updateUserProfile(userId, updateData);
  }
}
