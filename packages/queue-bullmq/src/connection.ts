import type { ConnectionOptions } from "bullmq";

export function getConnectionOptions(params: {
  readonly redisUrl: string;
}): ConnectionOptions {
  const url = new URL(params.redisUrl);

  return {
    host: url.hostname,
    port: Number.parseInt(url.port, 10) || 6379,
    password: url.password,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}
