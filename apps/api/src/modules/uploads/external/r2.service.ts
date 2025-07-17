import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";
import { R2_CONFIG } from "../../../shared/config/r2.config";
import { R2UploadError } from "../domain/upload.errors";

@injectable()
export class R2Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: R2_CONFIG.REGION,
      endpoint: R2_CONFIG.ENDPOINT,
      credentials: {
        accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
        secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
      },
    });
  }

  public async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 300,
  ): Promise<{
    presignedUrl: string;
    contentType: string;
    key: string;
    publicFileUrl: string;
  }> {
    try {
      const publicFileUrl = this.getPublicUrl(key);

      const command = new PutObjectCommand({
        Bucket: R2_CONFIG.BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        presignedUrl,
        contentType,
        key,
        publicFileUrl,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new R2UploadError(`Failed to generate signed URL: ${message}`);
    }
  }

  public getPublicUrl(key: string): string {
    return `${R2_CONFIG.PUBLIC_URL}/${key}`;
  }

  public parseKeyFromUrl(url: string): string | null {
    const publicUrl = R2_CONFIG.PUBLIC_URL;
    if (!url.startsWith(publicUrl)) {
      return null;
    }

    return url.substring(publicUrl.length + 1);
  }

  public isValidFileSize(size: number): boolean {
    return size <= R2_CONFIG.MAX_FILE_SIZE;
  }

  public isValidMimeType(mimeType: string): boolean {
    return R2_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType);
  }
}
