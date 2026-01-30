import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { errAsync } from "neverthrow";
import { coreError } from "@repo/core/common/core-error";
import { tryPromise } from "@repo/core/common/result";

import type { AppError } from "@repo/core/common/result";
import type { R2StoragePort } from "@repo/core/modules/material";

export type R2Credentials = {
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
};

export type R2ClientOptions = {
  readonly endpoint: string;
  readonly credentials: R2Credentials;
};

export type R2StorageOptions = {
  readonly client: S3Client;
  readonly bucket: string;
  readonly publicUrl?: string | null;
};

export type R2StorageConfig = {
  readonly endpoint?: string;
  readonly accessKeyId?: string;
  readonly secretAccessKey?: string;
  readonly bucket?: string;
  readonly publicUrl?: string | null;
};

export function createR2Client(options: R2ClientOptions): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: options.endpoint,
    credentials: options.credentials,
  });
}

function storageUnavailableError(): AppError {
  return coreError({
    code: "STORAGE_UNAVAILABLE",
    message: "R2 스토리지가 설정되지 않았습니다.",
  });
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

export function createR2StoragePort(
  options: R2StorageOptions | null,
): R2StoragePort {
  if (!options) {
    const error = storageUnavailableError();
    return {
      createPresignedPutUrl: () => errAsync(error),
      headObject: () => errAsync(error),
      getObjectBytes: () => errAsync(error),
      copyObject: () => errAsync(error),
      deleteObject: () => errAsync(error),
    };
  }

  return {
    createPresignedPutUrl: (params) =>
      tryPromise(async () => {
        const command = new PutObjectCommand({
          Bucket: options.bucket,
          Key: params.key,
          ContentType: params.contentType,
        });
        const url = await getSignedUrl(options.client, command, {
          expiresIn: params.expiresInSeconds,
        });
        return { url };
      }),

    headObject: (params) =>
      tryPromise(async () => {
        const res = await options.client.send(
          new HeadObjectCommand({ Bucket: options.bucket, Key: params.key }),
        );
        return {
          size:
            typeof res.ContentLength === "number" ? res.ContentLength : null,
          contentType: res.ContentType ?? null,
          etag: res.ETag ?? null,
        };
      }),

    getObjectBytes: (params) =>
      tryPromise(async () => {
        const res = await options.client.send(
          new GetObjectCommand({ Bucket: options.bucket, Key: params.key }),
        );
        return readBodyToBytes(res.Body);
      }),

    copyObject: (params) =>
      tryPromise(async () => {
        await options.client.send(
          new CopyObjectCommand({
            Bucket: options.bucket,
            Key: params.destinationKey,
            CopySource: encodeCopySource(options.bucket, params.sourceKey),
            ...(params.contentType
              ? {
                  ContentType: params.contentType,
                  MetadataDirective: "REPLACE",
                }
              : null),
          }),
        );
      }),

    deleteObject: (params) =>
      tryPromise(async () => {
        await options.client.send(
          new DeleteObjectCommand({ Bucket: options.bucket, Key: params.key }),
        );
      }),
  };
}

export function createR2StoragePortFromConfig(config: R2StorageConfig): {
  readonly port: R2StoragePort;
  readonly publicUrl: string | null;
} {
  const hasClientConfig =
    !!config.endpoint && !!config.accessKeyId && !!config.secretAccessKey;

  const hasBucket = !!config.bucket;

  if (!hasClientConfig || !hasBucket) {
    return { port: createR2StoragePort(null), publicUrl: null };
  }

  const client = createR2Client({
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return {
    port: createR2StoragePort({
      client,
      bucket: config.bucket,
      publicUrl: config.publicUrl ?? null,
    }),
    publicUrl: config.publicUrl ?? null,
  };
}
