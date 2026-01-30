# RAG Retrieval

## 개요

벡터 유사도 검색을 기반으로 한 **Retrieval-Augmented Generation (RAG)** 시스템. 학습 자료 내용 기반의 정확한 답변 제공.

## 설계 결정

### 1. Vector Similarity Search (벡터 유사도 검색)

**결정**: PGVector (PostgreSQL) + Cosine Similarity

**근거**:

- **Unified storage**: DB와 검색 엔진 통합으로 복잡성 감소
- **ACID**: 트랜잭션 내 consistency 보장
- **Cost**: 별도 vector DB 인프라 불필요
- **Scalability**: PostgreSQL scaling 패턴 활용

### 2. Scope-Limited Retrieval (범위 제한 검색)

**결정**: 사용자의 Plan/Material에 한정된 검색

**필터링 기준**:

```
- userId: 현재 사용자의 데이터만
- refIds: Plan에 포함된 자료만
- type: "material" | "plan" 등
```

**근거**:

- **Privacy**: 다른 사용자 데이터 노출 방지
- **Relevance**: Plan과 무관한 자료 노출 방지
- **Performance**: 인덱스 효율성 (scoped query)

### 3. Top-K Configuration (검색 결과 수)

| 용도         | Top-K | 근거                            |
| ------------ | ----- | ------------------------------- |
| Chat 답변    | 5     | 컨텍스트 크기 제한, 집중된 답변 |
| Plan 생성    | 10    | 커리큘럼에 활용, 더 많은 출처   |
| Session 학습 | 3     | 집중된 콘텐츠, 세션당 적정 분량 |

**근거**:

- **Context window**: Gemini Flash Lite의 제한 고려
- **Quality vs Quantity**: 너무 많은 결과는 noise
- **Latency**: 검색 결과 수와 응답 시간 trade-off

## 검색 모드

### 1. Semantic Search (유사도 검색)

**용도**: 자연어 질문에 대한 관련 내용 검색

```
Query → Embedding → Vector Search (cosine similarity) → Top-K results
```

**적용 시나리오**:

- Chat에서 사용자 질문에 답변
- 세션 생성 시 관련 청크 검색
- 자료 내 특정 주제 찾기

### 2. Range Retrieval (범위 조회)

**용도**: 특정 청크 범위의 연속된 내용 로드

```
refId + startIndex + endIndex → 순차적 청크 반환
```

**적용 시나리오**:

- Plan 생성 시 모듈의 chunkRange에 해당하는 청크 로드
- 세션 진행 시 해당 세션의 학습 범위 로드

### 3. Stats Retrieval (통계 조회)

**용도**: 자료별 청크 수, 상태 확인

```
refIds → Map<refId, { chunkCount }>
```

**적용 시나리오**:

- 자료 상세 페이지에서 인덱싱 상태 표시
- Plan 생성 전 자료 분량 확인

## Metadata-Driven Filtering

### 저장 메타데이터

```
- userId: 소유자 (필수 필터)
- type: 문서 유형
- refId: 자료 ID
- chunkIndex: 청크 순서
- pageNumber: 원본 페이지 (PDF용)
```

### 쿼리 패턴

**Semantic + Filter**:

```
Query: "React Hooks란?"
Filter: { userId, refIds: [mat1, mat2], type: "material" }
```

**Range Query**:

```
refId: "mat_xxx"
Range: start=10, end=20
Filter: { userId, type: "material" }
```

## hallucination 방지 전략

### 1. Scope Enforcement

**정책**: 제공된 자료에서만 답변

- **System prompt**: "문서에 없는 내용은 모른다고 답변"
- **Fallback**: "제공된 자료에서는 찾을 수 없습니다"
- **No inference**: 추측 금지

### 2. Citation Requirement

**정책**: 답변에 근거 표시 필수

- **Chunk reference**: 답변 출처 청크 표시
- **Page number**: PDF일 경우 페이지 번호
- **Confidence scoring**: (향후) 검색 신뢰도

### 3. Empty Result Handling

**정책**: 관련 결과 없을 때 명시적 처리

```
검색 결과 0개 → "관련 내용을 찾을 수 없습니다"
검색 결과 부적절 → "정확한 답변을 위한 자료가 필요합니다"
```

## 보이지 않는 규칙

1. **Always filter by userId**: 데이터 격리 필수
2. **Always validate refIds**: Plan snapshot 기준으로 고정
3. **Never return empty content**: 빈 청크는 필터링
4. **Always sort by chunkIndex**: Range retrieval 시 순서 보장
5. **Normalize query before embedding**: 대소문자, 특수문자 정규화

## 향후 개선 (MVP 이후)

### 재랭킹 (Re-ranking)

**계획**: Cross-encoder 기반 2차 정렬

```
1차: Vector similarity → Top-20
2차: Cross-encoder re-ranking
최종: Top-5
```

**근거**:

- **Precision**: 유사도만으로는 의미적 연관성 부족
- **Cost**: 모든 결과에 cross-encoder 적용은 비효율

### Hybrid Search

**계획**: 벡터 검색 + 키워드 검색 결합

**적용**:

- 정확한 용어 검색 (예: 특정 함수명)
- 메타데이터 기반 필터링 강화

## 참고 문서

- [Ingestion Pipeline](./ingestion-pipeline.md) - 청크 저장
- [Plan Generation](./plan-generation.md) - 검색 활용
- [packages/core/modules/knowledge](../../../packages/core/src/modules/knowledge/) - Knowledge 모듈
