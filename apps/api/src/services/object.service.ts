import { DI_SYMBOLS } from "@/containers/symbols";
import { ObjectRepository } from "@/db/repositories/object.repository";
import { DatabaseError } from "@/errors/database-error";
import status from "http-status";
import { inject, injectable } from "inversify";
import { nanoid } from "nanoid";
import { R2Service } from "./r2.service";

export interface CreateUploadRequestDto {
  userId: number;
  contentType: string;
  size?: number;
  customMetadata?: Record<string, unknown>;
}

export interface UploadCompleteDto {
  id: number;
  userId: number;
}

@injectable()
export class ObjectService {
  constructor(
    @inject(DI_SYMBOLS.objectRepository)
    private objectRepository: ObjectRepository,
    @inject(DI_SYMBOLS.r2Service)
    private r2Service: R2Service,
  ) {}

  /**
   * 새로운 업로드 요청을 생성하고 미리 서명된 URL을 반환합니다.
   */
  async createUploadRequest(dto: CreateUploadRequestDto): Promise<{
    id: number;
    uploadUrl: string;
  }> {
    // 1. 미리 서명된 URL 생성
    const key = nanoid();
    const presignResult = await this.r2Service.createPresignedUrl(
      key,
      dto.contentType,
      3600,
    );

    // 2. 객체 생성

    const object = await this.objectRepository.createObject({
      userId: dto.userId,
      bucket: presignResult.bucket,
      key,
      contentType: dto.contentType,
      size: dto.size,
      customMetadata: dto.customMetadata,
      isUploaded: false,
    });

    return {
      id: object.id,
      uploadUrl: presignResult.presignedUrl,
    };
  }

  /**
   * 업로드 완료를 처리합니다.
   */
  async completeUpload(dto: UploadCompleteDto): Promise<void> {
    // 1. 객체 소유자 검증
    const isOwner = await this.verifyObjectOwnership(dto.id, dto.userId);
    if (!isOwner) {
      throw new DatabaseError("Object not found", status.NOT_FOUND);
    }

    // 2. 업로드 완료 상태로 업데이트
    await this.objectRepository.markAsUploaded(dto.id);
  }

  /**
   * 사용자의 업로드된 객체 목록을 조회합니다.
   */
  async getUserObjects(userId: number) {
    return this.objectRepository.findByUserId(userId);
  }

  /**
   * 오래된 미완료 업로드를 정리합니다.
   */
  async cleanupStaleUploads(olderThan: Date): Promise<void> {
    const staleObjects =
      await this.objectRepository.findStaleObjects(olderThan);

    for (const object of staleObjects) {
      await this.objectRepository.delete(object.id);
    }
  }

  async verifyObjectOwnership(
    objectId: number,
    userId: number,
  ): Promise<boolean> {
    const object = await this.objectRepository.findById(objectId);
    return object?.userId === userId;
  }
}
