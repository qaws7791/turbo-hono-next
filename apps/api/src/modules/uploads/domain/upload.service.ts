import { inject, injectable } from "inversify";
import { TYPES } from "../../../container/types";
import { R2Service } from "../external/r2.service";
import { FileSizeExceededError, InvalidFileTypeError } from "./upload.errors";

@injectable()
export class UploadService {
  constructor(
    @inject(TYPES.R2Service)
    private readonly r2Service: R2Service,
  ) {}

  public async generatePresignedUrl({
    filename,
    contentType,
    size,
  }: {
    filename: string;
    contentType: string;
    size: number;
  }): Promise<{
    presignedUrl: string;
    objectKey: string;
    publicFileUrl: string;
  }> {
    this.validateFileType(contentType);
    this.validateFileSize(size);

    const { presignedUrl, publicFileUrl, key } =
      await this.r2Service.generatePresignedUrl(filename, contentType);

    return {
      presignedUrl,
      publicFileUrl,
      objectKey: key,
    };
  }

  private validateFileType(mimeType: string): void {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new InvalidFileTypeError(mimeType);
    }
  }

  private validateFileSize(size: number): void {
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB

    if (size > maxSizeInBytes) {
      throw new FileSizeExceededError(size, maxSizeInBytes);
    }
  }
}
