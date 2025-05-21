import { env } from "@/common/config/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";

@injectable()
export class R2Service {
  private s3Client: S3Client;
  private readonly R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
  private readonly R2_ENDPOINT = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  private readonly R2_BUCKET = env.R2_BUCKET_NAME;
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
    key: string,
    contentType: string,
    expiresIn = 3600, // 1시간
  ): Promise<{
    presignedUrl: string;
    objectKey: string;
    publicFileUrl: string;
    bucket: string;
  }> {
    const command = new PutObjectCommand({
      Bucket: this.R2_BUCKET,
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
      bucket: this.R2_BUCKET,
    };
  }
}
