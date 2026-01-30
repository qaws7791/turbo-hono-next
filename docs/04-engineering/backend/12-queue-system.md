# Queue System (BullMQ)

## 개요

**BullMQ** 기반 비동기 작업 처리. AI 생성, 파일 처리 등 **긴 작업을 백그라운드로 offload**.

## 아키텍처

```
┌─────────────────────────────────────────────┐
│              HTTP Request                   │
│        (Plan creation, File upload)         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           Core Service Layer                │
│    - Validation & Business Logic            │
│    - Enqueue Job (Result<JobId, Error>)     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              BullMQ Queue                   │
│    - Redis-backed                           │
│    - Job persistence                        │
│    - Retry logic                            │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│    Worker 1     │  │    Worker 2     │
│   (Process)     │  │   (Process)     │
└─────────────────┘  └─────────────────┘
         │                   │
         └─────────┬─────────┘
                   ▼
┌─────────────────────────────────────────────┐
│         Progress/Result Storage             │
│    - Job status tracking                    │
│    - Result persistence                     │
└─────────────────────────────────────────────┘
```

## 설계 결정

### 1. BullMQ 선택 이유

| Feature             | Custom    | BullMQ           |
| ------------------- | --------- | ---------------- |
| Redis atomicity     | 직접 구현 | ✅ Built-in      |
| Retry with backoff  | 직접 구현 | ✅ Configurable  |
| Job progress        | 직접 구현 | ✅ Built-in      |
| Concurrency control | 직접 구현 | ✅ Worker option |
| Priority queues     | 직접 구현 | ✅ Built-in      |

**근거**: 검증된 라이브러리 사용, 운영 복잡성 감소

### 2. Redis over In-Memory

**결정**: Redis (Upstash) 기반 큐

**근거**:

- **지속성**: 서버 재시작시 작업 유지
- **분산**: 다중 워커 인스턴스 지원
- **확장성**: Redis Cluster로 확장 가능

## 큐 유형

### 1. Plan Generation Queue

**목적**: AI 기반 학습 계획 생성

**Flow**:

```
1. User: POST /api/plans (goal, materialIds)
          ↓
2. API: Validation → enqueue plan-generation job
          ↓
3. Response: 202 Accepted { jobId, status: 'pending' }
          ↓
4. Worker:
   - Load materials
   - Call Gemini API
   - Generate blueprint
   - Save plan to DB
   - Update job status
          ↓
5. User: GET /api/jobs/{jobId} (polling)
```

**Job Data**:

```typescript
interface PlanGenerationJobData {
  userId: string;
  materialIds: string[];
  goal: string;
  planId: string;
}
```

### 2. Material Processing Queue

**목적**: 파일 업로드 후 텍스트 추출 및 분석

**Flow**:

```
1. User: POST /api/materials/complete-upload
          ↓
2. API: Validation → enqueue material-processing job
          ↓
3. Response: 202 Accepted { materialId, status: 'processing' }
          ↓
4. Worker:
   - Download from R2
   - Parse document
   - Generate embeddings
   - Save to vector store
   - Update material status
```

## 설정

### Redis Connection ([queue.config.ts](../../../apps/api/src/infrastructure/queue/queue.config.ts))

```typescript
export function getConnectionOptions(): ConnectionOptions {
  const url = new URL(process.env.REDIS_URL);

  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 6379,
    password: url.password,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}
```

### Default Job Options

```typescript
export const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600, // 1시간 후 삭제
    count: 100,
  },
  removeOnFail: {
    age: 86400, // 24시간 후 삭제
  },
};
```

## Worker 구현

### Worker Pattern

```typescript
export const planGenerationWorker = new Worker(
  "plan-generation",
  async (job) => {
    const { userId, materialIds, goal, planId } = job.data;

    await job.updateProgress(10);
    const materials = await loadMaterials(materialIds);
    await job.updateProgress(30);

    const blueprint = await generateBlueprint(goal, materials);
    await job.updateProgress(70);

    await savePlan(planId, blueprint);
    await job.updateProgress(100);

    return { planId };
  },
  {
    connection: getConnectionOptions(),
    concurrency: QUEUE_CONCURRENCY,
  },
);
```

### Graceful Shutdown

```typescript
export async function closeAll(): Promise<void> {
  await Promise.all([
    ...workers.map((w) => w.close()),
    ...queues.map((q) => q.close()),
  ]);
}
```

## Job Status Tracking

### Polling Pattern

```typescript
app.openapi(getJobStatusRoute, async (c) => {
  const job = await planGenerationQueue.getJob(jobId);
  if (!job) throw new ApiError(404, 'JOB_NOT_FOUND', ...);

  const state = await job.getState();
  const progress = job.progress;

  return c.json({
    data: {
      jobId: job.id,
      status: state,
      progress: progress,
      result: job.returnvalue,
      error: job.failedReason,
    },
  }, 200);
});
```

### Status Lifecycle

```
waiting → active → completed
                 ↘ failed (→ retry → waiting)
```

## 모범 사례

### DO

- ✅ **Job idempotency**: 동일 jobId로 여러번 실행해도 안전
- ✅ **Progress updates**: 장기 작업은 진행률 업데이트
- ✅ **Job data size**: 큰 데이터는 storage에 저장
- ✅ **Graceful shutdown**: SIGTERM 시 작업 완료 대기

### DON'T

- ❌ **동기적 대기**: HTTP 요청에서 job 완료 대기 금지
- ❌ **큰 job data**: 1MB 이상 데이터는 Redis에 저장하지 않음
- ❌ **무한 재시도**: attempts 제한 필수

## 참고 문서

- [BullMQ Documentation](https://docs.bullmq.io/)
- [queue.config.ts](../../../apps/api/src/infrastructure/queue/queue.config.ts)
- [queue.registry.ts](../../../apps/api/src/infrastructure/queue/queue.registry.ts)
