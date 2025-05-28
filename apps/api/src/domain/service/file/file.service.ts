import { DI_SYMBOLS } from '@/containers/di-symbols';
import { inject, injectable } from 'inversify';
import { IFileRepository } from '../../../infrastructure/database/repository/file/file.repository.interface';
import { IStorageService } from '../../../infrastructure/storage/storage.service.interface';
import { FileObject } from '../../entity/file.entity';
import { SERVICE_TYPES } from '../service.types';
import { IFileService } from './file.service.interface';

/**
 * 파일 서비스 구현
 */
@injectable()
export class FileService implements IFileService {
  constructor(
    @inject(DI_SYMBOLS.FileRepository)
    private fileRepository: IFileRepository,
    
    @inject(SERVICE_TYPES.StorageService)
    private storageService: IStorageService
  ) {}

  /**
   * 파일 업로드 준비 (업로드 URL 생성)
   */
  async prepareUpload(
    userId: number,
    filename: string,
    contentType: string,
    size: number
  ): Promise<{ fileObject: FileObject; uploadUrl: string }> {
    // 버킷 이름 결정 (이미지인 경우 이미지 버킷, 그 외는 일반 버킷)
    const bucket = contentType.startsWith('image/') ? 'images' : 'files';
    
    // 파일 키 생성 (userId/timestamp-filename 형식)
    const timestamp = Date.now();
    const key = `${userId}/${timestamp}-${filename}`;
    
    // 파일 객체 생성
    const fileObject = FileObject.create(
      userId,
      bucket,
      key,
      filename,
      contentType,
      size
    );
    
    // 파일 객체 저장
    const createdFile = await this.fileRepository.create(fileObject);
    
    // 업로드 URL 생성
    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      bucket,
      key,
      contentType,
      size
    );
    
    return { fileObject: createdFile, uploadUrl };
  }

  /**
   * 파일 업로드 완료 처리
   */
  async completeUpload(fileId: number, userId: number): Promise<FileObject> {
    // 파일 조회
    const fileObject = await this.getUserFileById(fileId, userId);
    
    // 이미 업로드 완료된 경우
    if (fileObject.isUploaded) {
      return fileObject;
    }
    
    // 파일 존재 확인
    const exists = await this.storageService.checkFileExists(
      fileObject.bucket,
      fileObject.key
    );
    
    if (!exists) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }
    
    // 업로드 완료 처리
    fileObject.markAsUploaded();
    await this.fileRepository.update(fileObject);
    
    return fileObject;
  }

  /**
   * 파일 조회
   */
  async getFileById(fileId: number): Promise<FileObject> {
    const fileObject = await this.fileRepository.findById(fileId);
    if (!fileObject) {
      throw new Error('파일을 찾을 수 없습니다.');
    }
    return fileObject;
  }

  /**
   * 사용자의 파일 조회
   */
  async getUserFileById(fileId: number, userId: number): Promise<FileObject> {
    const fileObject = await this.fileRepository.findById(fileId);
    if (!fileObject) {
      throw new Error('파일을 찾을 수 없습니다.');
    }
    
    // 파일 소유자 확인
    if (fileObject.userId !== userId) {
      throw new Error('파일에 접근할 권한이 없습니다.');
    }
    
    return fileObject;
  }

  /**
   * 파일 삭제
   */
  async deleteFile(fileId: number, userId: number): Promise<void> {
    // 파일 조회
    const fileObject = await this.getUserFileById(fileId, userId);
    
    // 스토리지에서 파일 삭제
    await this.storageService.deleteFile(fileObject.bucket, fileObject.key);
    
    // DB에서 파일 정보 삭제
    await this.fileRepository.deleteById(fileId);
  }

  /**
   * 파일 URL 생성
   */
  getFileUrl(fileObject: FileObject): string {
    return fileObject.getUrl();
  }
}
