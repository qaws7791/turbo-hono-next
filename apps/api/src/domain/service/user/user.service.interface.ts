import { User } from '../../entity/user.entity';
import { UserStatus } from '../../entity/user.types';

/**
 * 사용자 서비스 인터페이스
 * 사용자 관련 기능을 정의합니다.
 */
export interface IUserService {
  /**
   * 사용자 ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 정보
   */
  getUserById(id: number): Promise<User>;

  /**
   * 내 정보 조회
   * @param userId 현재 로그인한 사용자 ID
   * @returns 사용자 정보
   */
  getMyInfo(userId: number): Promise<User>;

  /**
   * 내 정보 수정
   * @param userId 현재 로그인한 사용자 ID
   * @param data 수정할 정보
   * @returns 수정된 사용자 정보
   */
  updateMyInfo(
    userId: number,
    data: {
      name?: string;
      profileImageUrl?: string | null;
    }
  ): Promise<User>;

  /**
   * 사용자 상태 변경
   * @param userId 사용자 ID
   * @param status 변경할 상태
   * @returns 수정된 사용자 정보
   */
  updateUserStatus(userId: number, status: UserStatus): Promise<User>;
}
