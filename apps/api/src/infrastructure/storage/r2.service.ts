import { env } from "@/common/config/env";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";
import { IR2Service } from "./r2.service.interface";

@injectable()
export class R2Service implements IR2Service {
  private s3Client: S3Client;
  private readonly R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
  private readonly R2_ENDPOINT = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  private readonly R2_PUBLIC_BASE_URL = env.R2_PUBLIC_BASE_URL;
  private readonly R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
  constructor() {
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: this.R2_ENDPOINT,
      credentials: {
        accessKeyId: this.R2_ACCESS_KEY_ID,
        secretAccessKey: this.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * 업로드를 위한 미리 서명된 URL을 생성합니다.
   */
  async createPresignedUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresIn = 3600, // 1시간
  ): Promise<{
    bucket: string;
    presignedUrl: string;
    objectKey: string;
    publicFileUrl: string;
  }> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
    return {
      presignedUrl,
      objectKey: key,
      publicFileUrl: `${this.R2_PUBLIC_BASE_URL}/${key}`,
      bucket,
    };
  }

  async checkFileExists(bucket: string, key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error instanceof S3ServiceException && error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  } 

  async deleteFile(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }
}
