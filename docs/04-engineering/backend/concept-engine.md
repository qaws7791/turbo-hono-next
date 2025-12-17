# Concept Engine

## 개요

Concept 생성/업데이트/병합 규칙, 관계(RELATED/PREREQUISITE) 생성 로직을 정의합니다.

---

## 생성 트리거

세션 완료 시:

1. 학습한 내용에서 핵심 개념 추출
2. 기존 Concept과 매칭
3. 신규 생성 또는 업데이트

---

## 매칭 로직

```typescript
async function findOrCreateConcept(title: string, spaceId: string) {
  // 1. 제목 유사도 검색
  const existing = await db
    .select()
    .from(concepts)
    .where(
      and(eq(concepts.spaceId, spaceId), ilike(concepts.title, `%${title}%`)),
    )
    .limit(5);

  // 2. 임베딩 유사도로 정밀 매칭
  const matched = await findBySimilarity(title, existing);

  if (matched && matched.score > 0.9) {
    return { concept: matched, action: "UPDATE" };
  }

  // 3. 신규 생성
  return { concept: await createConcept(title, spaceId), action: "CREATE" };
}
```

---

## 관계 생성

### 관계 유형

| 유형         | 설명      |
| ------------ | --------- |
| RELATED      | 연관 개념 |
| PREREQUISITE | 선행 개념 |
| SIMILAR      | 유사 개념 |
| CONTRAST     | 대조 개념 |

### 자동 생성

```typescript
async function generateRelations(conceptId: string, content: string) {
  const existing = await getAllConcepts(spaceId);

  // LLM으로 관계 추론
  const relations = await llm.analyze({
    prompt: `새 개념: ${content}\n기존 개념: ${existing.map((c) => c.title)}\n관계 추출:`,
  });

  await saveRelations(conceptId, relations);
}
```

---

## 재계산 트리거

- 새 Concept 생성 시
- Concept 병합 시
- 수동 트리거

---

## 관련 문서

- [Concepts API](../api/concepts.md)
- [Concept Library](../../03-product/pages/concept-library.md)
