/**
 * BullMQ Queue 설정
 *
 * Upstash Redis와 함께 BullMQ를 사용하기 위한 설정입니다.
 * @see https://upstash.com/docs/redis/integrations/bullmq
 */
import type { ConnectionOptions, DefaultJobOptions } from "bullmq";

/**
 * Redis 연결 옵션 생성
 *
 * BullMQ에서 Upstash Redis를 사용하기 위한 설정
 */
export function getConnectionOptions(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL 환경 변수가 설정되지 않았습니다.");
  }

  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 6379,
    password: url.password,
    // Upstash Redis는 TLS 설정을 명시적으로 요구하는 경우가 많습니다.
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null, // BullMQ 필수 설정
    enableReadyCheck: false,
  };
}

/**
 * 기본 작업 옵션
 */
export const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600, // 1시간 후 완료된 작업 삭제
    count: 100, // 최대 100개 유지
  },
  removeOnFail: {
    age: 86400, // 24시간 후 실패한 작업 삭제
  },
};

/**
 * Queue 동시 처리 수
 */
export const QUEUE_CONCURRENCY = Number(process.env.QUEUE_CONCURRENCY) || 2;
