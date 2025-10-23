import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { CONFIG } from "../config";

/**
 * R2 클라이언트 초기화
 * Cloudflare R2는 S3 호환 API를 제공
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: CONFIG.R2_ENDPOINT,
  credentials: {
    accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * R2에 파일 업로드
 * @param key - 저장할 파일의 고유 키
 * @param buffer - 파일 데이터
 * @param contentType - MIME 타입
 * @returns 파일의 공개 URL
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: CONFIG.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${CONFIG.R2_PUBLIC_URL}/${key}`;
}

/**
 * R2에서 파일 가져오기
 * @param key - 파일 키
 * @returns 파일 데이터 Buffer
 */
export async function getFromR2(key: string): Promise<Buffer> {
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: CONFIG.R2_BUCKET_NAME,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("File not found in R2");
  }

  return bodyToBuffer(response.Body);
}

/**
 * R2에서 파일 삭제
 * @param key - 삭제할 파일 키
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: CONFIG.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

/**
 * 안전한 파일 키 생성
 * @param userId - 사용자 ID
 * @param fileName - 원본 파일명
 * @returns pdfs/{userId}/{timestamp}-{uuid}.{ext}
 */
export function generateStorageKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const ext = fileName.split(".").pop();

  return `pdfs/${userId}/${timestamp}-${uuid}.${ext}`;
}

type GetObjectBody = NonNullable<GetObjectCommandOutput["Body"]>;

function resolvePublicBaseUrl(): string {
  const baseUrl =
    process.env.R2_PUBLIC_BASE_URL ?? process.env.R2_PUBLIC_URL ?? "";

  if (!baseUrl) {
    throw new Error("R2 public URL is not configured");
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function hasTransformToByteArray(body: GetObjectBody): body is GetObjectBody & {
  transformToByteArray: () => Promise<Uint8Array>;
} {
  return (
    typeof (body as { transformToByteArray?: unknown }).transformToByteArray ===
    "function"
  );
}

function isAsyncIterable(
  value: GetObjectBody,
): value is GetObjectBody & AsyncIterable<unknown> {
  return (
    typeof value === "object" && value !== null && Symbol.asyncIterator in value
  );
}

async function collectFromAsyncIterable(
  source: AsyncIterable<unknown>,
): Promise<Buffer> {
  const chunks: Array<Buffer> = [];

  for await (const chunk of source) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else if (chunk instanceof Uint8Array) {
      chunks.push(Buffer.from(chunk));
    } else {
      throw new Error("Unsupported stream chunk type");
    }
  }

  return Buffer.concat(chunks);
}

async function bodyToBuffer(body: GetObjectBody): Promise<Buffer> {
  if (hasTransformToByteArray(body)) {
    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  if (isAsyncIterable(body)) {
    return collectFromAsyncIterable(body);
  }

  if (
    typeof (body as { arrayBuffer?: () => Promise<ArrayBuffer> })
      .arrayBuffer === "function"
  ) {
    const arrayBuffer = await (
      body as {
        arrayBuffer: () => Promise<ArrayBuffer>;
      }
    ).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("Unsupported R2 response body type");
}
