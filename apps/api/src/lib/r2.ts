import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

export type R2Context = {
  readonly client: S3Client;
  readonly bucket: string;
  readonly publicUrl: string | null;
};

function createR2Client(): S3Client | null {
  if (
    !CONFIG.R2_ACCESS_KEY_ID ||
    !CONFIG.R2_SECRET_ACCESS_KEY ||
    !CONFIG.R2_BUCKET_NAME ||
    !CONFIG.R2_ENDPOINT
  ) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: CONFIG.R2_ENDPOINT,
    credentials: {
      accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
    },
  });
}

const r2Client = createR2Client();

export function requireR2(): R2Context {
  if (!r2Client || !CONFIG.R2_BUCKET_NAME) {
    throw new ApiError(
      503,
      "STORAGE_UNAVAILABLE",
      "R2 스토리지가 설정되지 않았습니다.",
    );
  }

  return {
    client: r2Client,
    bucket: CONFIG.R2_BUCKET_NAME,
    publicUrl: CONFIG.R2_PUBLIC_URL ?? null,
  };
}

function encodeCopySource(bucket: string, key: string): string {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${bucket}/${encodedKey}`;
}

async function readBodyToBytes(body: unknown): Promise<Uint8Array> {
  if (!body) return new Uint8Array();

  if (body instanceof Uint8Array) return body;

  if (
    typeof body === "object" &&
    body !== null &&
    Symbol.asyncIterator in body
  ) {
    const chunks: Array<Uint8Array> = [];
    for await (const chunk of body as AsyncIterable<unknown>) {
      if (chunk instanceof Uint8Array) {
        chunks.push(chunk);
      } else if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else if (chunk instanceof Buffer) {
        chunks.push(new Uint8Array(chunk));
      } else {
        throw new Error("Unsupported stream chunk type");
      }
    }
    return Buffer.concat(chunks);
  }

  throw new Error("Unsupported body type");
}

export async function createPresignedPutUrl(params: {
  readonly key: string;
  readonly contentType: string;
  readonly expiresInSeconds: number;
}): Promise<{ url: string }> {
  const { client, bucket } = requireR2();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
  });
  const url = await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds,
  });
  return { url };
}

export async function createPresignedGetUrl(params: {
  readonly key: string;
  readonly expiresInSeconds: number;
}): Promise<{ url: string }> {
  const { client, bucket } = requireR2();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: params.key,
  });
  const url = await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds,
  });
  return { url };
}

export async function headObject(params: { readonly key: string }): Promise<{
  size: number | null;
  contentType: string | null;
  etag: string | null;
}> {
  const { client, bucket } = requireR2();
  const res = await client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: params.key }),
  );
  return {
    size: typeof res.ContentLength === "number" ? res.ContentLength : null,
    contentType: res.ContentType ?? null,
    etag: res.ETag ?? null,
  };
}

export async function getObjectBytes(params: {
  readonly key: string;
}): Promise<Uint8Array> {
  const { client, bucket } = requireR2();
  const res = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: params.key }),
  );
  return readBodyToBytes(res.Body);
}

export async function copyObject(params: {
  readonly sourceKey: string;
  readonly destinationKey: string;
  readonly contentType: string | null;
}): Promise<void> {
  const { client, bucket } = requireR2();

  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: params.destinationKey,
      CopySource: encodeCopySource(bucket, params.sourceKey),
      ...(params.contentType
        ? {
            ContentType: params.contentType,
            MetadataDirective: "REPLACE",
          }
        : null),
    }),
  );
}

export async function deleteObject(params: {
  readonly key: string;
}): Promise<void> {
  const { client, bucket } = requireR2();
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: params.key }),
  );
}
