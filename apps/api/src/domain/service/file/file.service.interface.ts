import { FileObject } from '../../entity/file.entity';

/**
 * 파일 서비스 인터페이스
 * 파일 업로드 및 관리 관련 기능을 정의합니다.
 */
export interface IFileService {
  /**
   * 파일 업로드 준비 (업로드 URL 생성)
   * @param userId 현재 로그인한 사용자 ID
   * @param filename 파일 이름
   * @param contentType 파일 타입
   * @param size 파일 크기
   * @returns 생성된 파일 객체와 업로드 URL
   */
  prepareUpload(
    userId: number,
    filename: string,
    contentType: string,
    size: number
  ): Promise<{ fileObject: FileObject; uploadUrl: string }>;

  /**
   * 파일 업로드 완료 처리
   * @param fileId 파일 ID
   * @param userId 현재 로그인한 사용자 ID
   * @returns 업데이트된 파일 객체
   */
  completeUpload(fileId: number, userId: number): Promise<FileObject>;

  /**
   * 파일 조회
   * @param fileId 파일 ID
   * @returns 파일 객체
   */
  getFileById(fileId: number): Promise<FileObject>;

  /**
   * 사용자의 파일 조회
   * @param fileId 파일 ID
   * @param userId 현재 로그인한 사용자 ID
   * @returns 파일 객체
   */
  getUserFileById(fileId: number, userId: number): Promise<FileObject>;

  /**
   * 파일 삭제
   * @param fileId 파일 ID
   * @param userId 현재 로그인한 사용자 ID
   */
  deleteFile(fileId: number, userId: number): Promise<void>;

  /**
   * 파일 URL 생성
   * @param fileObject 파일 객체
   * @returns 파일 URL
   */
  getFileUrl(fileObject: FileObject): string;
}
