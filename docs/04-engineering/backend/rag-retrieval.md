# RAG Retrieval

## 개요

벡터 검색 전략, 필터링, Top-K 설정, 재랭킹 도입 시점을 정의합니다.

---

## 검색 전략

### MVP: 벡터 유사도 검색

```typescript
async function retrieve(query: string, materialIds: string[], topK = 5) {
  const queryVector = await embed(query);

  return db.execute(sql`
    SELECT c.*, e.vector <=> ${queryVector} AS distance
    FROM material_chunks c
    JOIN material_embeddings e ON c.id = e.chunk_id
    WHERE c.material_id = ANY(${materialIds})
    ORDER BY distance
    LIMIT ${topK}
  `);
}
```

### 필터링

| 필터              | 설명                        |
| ----------------- | --------------------------- |
| materialIds       | Plan 스냅샷에 포함된 문서만 |
| deletedAt IS NULL | 삭제되지 않은 문서          |

---

## Top-K 설정

| 용도         | Top-K | 근거               |
| ------------ | ----- | ------------------ |
| Chat 답변    | 5     | 컨텍스트 크기 제한 |
| Plan 생성    | 10    | 커리큘럼에 활용    |
| Session 학습 | 3     | 집중된 콘텐츠      |

---

## 재랭킹 (향후)

MVP 이후 품질 개선을 위해 재랭킹 도입 고려:

1. **초기 검색**: Top-20 후보
2. **재랭킹**: Cross-encoder로 순위 재조정
3. **최종 선택**: Top-5

---

## 근거 일탈 방지

1. **스코프 제한**: Plan 문서만 검색
2. **프롬프트 제약**: "문서에 없으면 모른다고 답변"
3. **Citation 요구**: 근거 없이 답변 금지

---

## 관련 문서

- [Chat API](../api/chat.md)
- [ADR: RAG Scope](../adr/0004-rag-scope-and-citations.md)
