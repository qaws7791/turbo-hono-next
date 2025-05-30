/**
 * Cloudflare R2 스토리지 서비스를 위한 인터페이스
 * 파일 업로드를 위한 미리 서명된 URL 생성 기능을 제공합니다.
 */
export interface IR2Service {
  /**
   * 업로드를 위한 미리 서명된 URL을 생성합니다.
   * 
   * @param bucket - 파일이 저장될 버킷 이름
   * @param key - 파일이 저장될 경로와 이름
   * @param contentType - 파일의 MIME 타입
   * @param expiresIn - URL의 만료 시간(초), 기본값은 3600초(1시간)
   * @returns 미리 서명된 URL 정보를 포함한 객체
   */
  createPresignedUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresIn?: number
  ): Promise<{
    bucket: string;
    presignedUrl: string;
    objectKey: string;
    publicFileUrl: string;
  }>;

  /**
   * 파일이 존재하는지 확인합니다.
   * 
   * @param bucket - 파일이 저장된 버킷 이름
   * @param key - 파일이 저장된 경로와 이름
   * @returns 파일이 존재하는지의 여부
   */
  checkFileExists(bucket: string, key: string): Promise<boolean>;


  /**
   * 파일을 삭제합니다.
   * 
   * @param bucket - 파일이 저장된 버킷 이름
   * @param key - 파일이 저장된 경로와 이름
   */
  deleteFile(bucket: string, key: string): Promise<void>;
}
