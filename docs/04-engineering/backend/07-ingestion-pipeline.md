# Ingestion Pipeline

## 개요

학습 자료 업로드 후 텍스트 추출 → 청크 분할 → 임베딩 생성 → 벡터 저장소 저장까지의 **비동기 데이터 처리 파이프라인**.

## 설계 결정

### 1. Asynchronous Processing (비동기 처리)

**결정**: 파일 처리는 백그라운드 큐(BullMQ)에서 실행

**근거**:

- **UX**: 대용량 파일 업로드 시 사용자가 즉시 응답 받음 (202 Accepted)
- **Reliability**: 처리 실패 시 자동 재시도, Dead letter queue
- **Scalability**: Worker 인스턴스를 독립적으로 확장 가능
- **Resource isolation**: 무거운 AI/파싱 작업이 API 서버 부하 방지

### 2. Chunking Strategy (청크 분할 전략)

**결정**: Recursive Character Text Splitter 사용

| 설정         | 값          | 근거                           |
| ------------ | ----------- | ------------------------------ |
| chunkSize    | 1000 tokens | 문맥 유지 + 검색 정밀도 균형   |
| chunkOverlap | 200 tokens  | 경계 문맥 보존, 정보 손실 방지 |

**근거**:

- **Gemini embedding-001**: 1536차원, 최대 2048 tokens
- **검색 품질**: 너무 작으면 문맥 파괴, 너무 크면 정밀도 저하
- **RAG 성능**: 적절한 청크 크기가 retrieval 품질에 결정적

### 3. Re-indexing on Update (재인덱싱)

**결정**: 자료 업데이트 시 기존 인덱스 삭제 후 재생성

**근거**:

- **데이터 일관성**: 오래된 청크 잔여 방지
- **Simplicity**: 부분 업데이트 복잡성 회피
- **Trade-off**: 재처리 비용 vs 데이터 정확성

## 파이프라인 단계

```
┌─────────────────────────────────────────────────────────┐
│ 1. Parse (텍스트 추출)                                  │
│    - 파일 타입별 파서 선택                              │
│    - 메타데이터 추출 (페이지 번호 등)                   │
│    - 오류 시 즉시 실패 (재시도 없음)                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Chunk (분할)                                         │
│    - RecursiveCharacterTextSplitter                     │
│    - 청크당 메타데이터 부여 (chunkIndex, pageNumber)      │
│    - 빈 청크 필터링                                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Embed (임베딩)                                       │
│    - Gemini embedding-001                               │
│    - 배치 처리 (100개씩)                                │
│    - 실패 시 지수 백오프 재시도 (3회)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Store (저장)                                         │
│    - PGVector (PostgreSQL + pgvector)                   │
│    - 메타데이터 JSONB 저장                              │
│    - User-scoped collection                             │
└─────────────────────────────────────────────────────────┘
```

## 지원 파일 형식

| 형식     | 파서                 | 특수 처리        |
| -------- | -------------------- | ---------------- |
| PDF      | Langchain PDFLoader  | 페이지 번호 추출 |
| DOCX     | Langchain DocxLoader | 문서 구조 인식   |
| Markdown | 직접 파싱            | 헤더 구조 보존   |
| TEXT     | 직접 파싱            | UTF-8 인코딩     |

## 메타데이터 체계

**청크 메타데이터** (PGVector JSONB):

```
- userId: 소유자 식별
- type: "material" | "plan" 등
- refId: Material ID
- title: 자료 제목
- originalFilename: 원본 파일명
- mimeType: MIME 타입
- chunkIndex: 청크 순서 (0-based)
- pageNumber: PDF 페이지 번호 (선택적)
```

**근거**:

- **Multi-tenancy**: userId로 데이터 격리
- **Retrieval filtering**: type, refId로 검색 범위 제한
- **Citation**: pageNumber로 출처 표시

## 실패 처리 정책

| 단계  | 재시도 | 실패 시 동작 | 이유                            |
| ----- | ------ | ------------ | ------------------------------- |
| Parse | 0회    | 즉시 FAILED  | 파일 자체의 문제, 재시도 무의미 |
| Chunk | 0회    | 즉시 FAILED  | 파싱 결과의 문제                |
| Embed | 3회    | FAILED       | API 일시 오류 가능              |
| Store | 3회    | FAILED       | DB 연결 일시 오류 가능          |

### 오류 코드

| 코드                        | 상황                             |
| --------------------------- | -------------------------------- |
| `MATERIAL_PARSE_FAILED`     | 텍스트 추출 실패, 청크 분할 실패 |
| `MATERIAL_UNSUPPORTED_TYPE` | 지원하지 않는 파일 형식          |
| `KNOWLEDGE_INDEX_FAILED`    | 임베딩 생성/저장 실패            |

## 보이지 않는 규칙

1. **Never store raw files in vector DB**: 원본 파일은 R2에, 벡터 DB에는 텍스트/임베딩만
2. **Always validate chunk count**: 0개 청크는 즉시 오류
3. **Always include chunkIndex**: 순서 보장 필수
4. **Normalize text before embedding**: \0, \s+ 정규화
5. **Re-index atomically**: 삭제→추가는 트랜잭션 내에서

## 참고 문서

- [packages/core/modules/knowledge](../../../packages/core/src/modules/knowledge/) - Knowledge 모듈
- [packages/core/modules/material](../../../packages/core/src/modules/material/) - Material 모듈
- [Queue System](./05-queue-system.md) - BullMQ 설정
