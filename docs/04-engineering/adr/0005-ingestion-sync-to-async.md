# ADR 0005: Ingestion 동기/비동기 전환

## 상태

**확정** (2025-12)

---

## 컨텍스트

문서 업로드 후 인덱싱(parse → chunk → embed)은 문서 크기에 따라 수 초에서 수 분까지 소요될 수 있습니다.

- **동기 처리**: 요청-응답 한 사이클에서 완료
- **비동기 처리**: 요청 접수 → 백그라운드 처리 → 상태 조회

MVP에서의 접근 방식과 전환 기준을 결정해야 합니다.

---

## 결정

**MVP는 동기 처리를 기본으로 하되, 비동기 전환 인터페이스를 준비**합니다.

### 전환 기준

| 조건                                | 처리 방식 |
| ----------------------------------- | --------- |
| 페이지 수 < 20 AND 예상 시간 < 30초 | 동기      |
| 페이지 수 ≥ 20 OR 예상 시간 ≥ 30초  | 비동기    |

---

## 상세 설계

### MVP (동기)

```
POST /materials
Request: { file, spaceId, ... }
Response: 201 Created { id, status: "READY", ... }

처리 시간: 평균 10~20초 (20페이지 이하 PDF)
```

### 확장 (비동기)

```
POST /materials
Request: { file, spaceId, ... }
Response: 202 Accepted { id, jobId, status: "PROCESSING" }

GET /jobs/{jobId}
Response: { status: "RUNNING", progress: 0.65 }

// 또는 SSE
GET /jobs/{jobId}/stream
Event: { status: "RUNNING", progress: 0.80 }
Event: { status: "COMPLETED", result: { materialId } }
```

---

## API 계약 변경

### Request (변경 없음)

```typescript
interface CreateMaterialRequest {
  file?: File; // 파일 업로드
  url?: string; // URL 입력
  text?: string; // 텍스트 입력
  spaceId: string;
  title?: string;
}
```

### Response (동기)

```typescript
interface MaterialResponse {
  id: string;
  status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  title: string;
  summary?: string;
  // status === 'READY'인 경우에만 반환
}
```

### Response (비동기)

```typescript
interface MaterialAcceptedResponse {
  id: string;
  jobId: string;
  status: "PROCESSING";
}

interface JobStatusResponse {
  jobId: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
  progress?: number; // 0~1
  result?: {
    materialId: string;
    summary: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 전환 시점 판단

### 클라이언트 사전 판단

```typescript
async function uploadMaterial(file: File, spaceId: string) {
  const estimatedPages = await estimatePages(file);

  if (estimatedPages >= 20) {
    // 비동기 UI 표시 (진행률 바, 백그라운드 알림)
    return uploadAsync(file, spaceId);
  } else {
    // 동기 처리 (로딩 스피너, 완료 대기)
    return uploadSync(file, spaceId);
  }
}
```

### 서버 자동 전환

```typescript
async function processUpload(file: Buffer, spaceId: string) {
  const textLength = await extractTextLength(file);
  const estimatedTime = textLength / TOKENS_PER_SECOND;

  if (estimatedTime > 30) {
    // 비동기 잡 생성
    const job = await queue.add("ingestion", { file, spaceId });
    return { jobId: job.id, status: "PROCESSING" };
  } else {
    // 동기 처리
    const material = await ingestSync(file, spaceId);
    return { id: material.id, status: "READY" };
  }
}
```

---

## 근거

### 동기 우선 채택 이유

1. **구현 단순성**
   - 잡 큐, 워커, 상태 관리 불필요
   - MVP 개발 속도 향상

2. **UX 직관성**
   - 업로드 → 완료 흐름이 명확
   - 추가 상태 조회 UI 불필요

3. **충분한 범위**
   - 대부분의 학습 자료는 20페이지 이하
   - 초기 사용자 시나리오 충족

### 비동기 전환 대비 이유

1. **확장성**
   - 대형 문서, 다중 업로드 대응
   - 서버 부하 분산

2. **사용자 경험**
   - 장시간 대기 대신 백그라운드 처리
   - 다른 작업 가능

---

## 구현 지침

### 동기 처리 (MVP)

```typescript
// routes/materials.ts
app.post("/materials", async (c) => {
  const { file, spaceId } = await c.req.parseBody();

  // 1. R2에 파일 업로드
  const objectKey = await uploadToR2(file);

  // 2. Material 레코드 생성
  const [material] = await db
    .insert(materials)
    .values({
      spaceId,
      storageKey: objectKey,
      processingStatus: "PROCESSING",
    })
    .returning();

  try {
    // 3. 동기 인덱싱
    const text = await parseDocument(file);
    const chunks = await chunkText(text);
    await embedAndStore(material.id, chunks);

    // 4. 상태 업데이트
    await db
      .update(materials)
      .set({ processingStatus: "READY" })
      .where(eq(materials.id, material.id));

    return c.json({ id: material.id, status: "READY" }, 201);
  } catch (error) {
    await db
      .update(materials)
      .set({ processingStatus: "FAILED", errorMessage: error.message })
      .where(eq(materials.id, material.id));
    throw error;
  }
});
```

### 비동기 전환 시

```typescript
// 잡 큐 설정 (BullMQ 예시)
const ingestionQueue = new Queue("ingestion", { connection: redis });

// 워커
const worker = new Worker(
  "ingestion",
  async (job) => {
    const { materialId, file } = job.data;

    await job.updateProgress(0);
    const text = await parseDocument(file);
    await job.updateProgress(30);

    const chunks = await chunkText(text);
    await job.updateProgress(50);

    await embedAndStore(materialId, chunks);
    await job.updateProgress(100);

    await db
      .update(materials)
      .set({ processingStatus: "READY" })
      .where(eq(materials.id, materialId));
  },
  { connection: redis },
);
```

---

## 결과

### 긍정적

- MVP 빠른 출시
- 전환 경로 명확

### 부정적

- 대형 문서 처리 제한 (MVP)
- 타임아웃 리스크

---

## 관련 문서

- [Ingestion Pipeline](../backend/ingestion-pipeline.md)
- [Materials API](../api/materials.md)
- [Background Jobs](../backend/background-jobs.md)
