import { DI_SYMBOLS } from '@/containers/di-symbols';
import { inject, injectable } from 'inversify';
import type { IUserRepository } from '../../../infrastructure/database/repository/user/user.repository.interface';
import { User } from '../../entity/user.entity';
import { UserStatus } from '../../entity/user.types';
import { IUserService } from './user.service.interface';

/**
 * 사용자 서비스 구현
 */
@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(DI_SYMBOLS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  /**
   * 사용자 ID로 사용자 조회
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  /**
   * 내 정보 조회
   */
  async getMyInfo(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  /**
   * 내 정보 수정
   */
  async updateMyInfo(
    userId: number,
    data: {
      name?: string;
      profileImageUrl?: string | null;
    }
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 이름 업데이트
    if (data.name !== undefined) {
      user.updateName(data.name);
    }

    // 프로필 이미지 업데이트
    if (data.profileImageUrl !== undefined) {
      user.updateProfileImage(data.profileImageUrl);
    }

    // 저장
    await this.userRepository.update(user);
    return user;
  }

  /**
   * 사용자 상태 변경
   */
  async updateUserStatus(userId: number, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    user.updateStatus(status);
    await this.userRepository.update(user);
    return user;
  }
}
