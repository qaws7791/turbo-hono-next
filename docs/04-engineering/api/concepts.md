# Concepts API

## 개요

Concept(핵심 개념)의 조회, 검색, 복습 상태 관리 API입니다.

---

## 엔드포인트

### Concept 목록 조회

```
GET /api/v1/spaces/{spaceId}/concepts
```

**Query Parameters**: page, limit, search, reviewStatus (GOOD/DUE/OVERDUE)

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "useState Hook",
      "oneLiner": "React에서 상태를 관리하는 Hook",
      "tags": ["react", "hooks"],
      "reviewStatus": "DUE",
      "srsDueAt": "2025-01-20T00:00:00Z",
      "lastLearnedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": { "total": 50 }
}
```

### Concept 상세 조회

```
GET /api/v1/concepts/{conceptId}
```

**Response** (200):

```json
{
  "data": {
    "id": "uuid",
    "title": "useState Hook",
    "oneLiner": "React에서 상태를 관리하는 Hook",
    "ariNoteMd": "## 정의\n...",
    "tags": ["react", "hooks"],
    "relatedConcepts": [{ "id": "uuid", "title": "useEffect" }],
    "learningHistory": [
      { "sessionRunId": "uuid", "linkType": "CREATED", "date": "..." }
    ],
    "srsState": { "interval": 7, "ease": 2.5, "dueAt": "..." }
  }
}
```

### 복습 기록

```
POST /api/v1/concepts/{conceptId}/reviews
```

**Request**:

```json
{
  "rating": "GOOD",
  "sessionRunId": "uuid"
}
```

rating: AGAIN / HARD / GOOD / EASY

**Response** (201):

```json
{
  "data": {
    "nextDueAt": "2025-01-27T00:00:00Z",
    "newInterval": 7
  }
}
```

### 전체 Space Concept 검색

```
GET /api/v1/concepts/search
```

**Query**: q (검색어), spaceIds (배열)

---

## 복습 상태

| 상태         | 조건                          |
| ------------ | ----------------------------- |
| GOOD (🟢)    | dueAt > today + 3일           |
| DUE (🟡)     | today <= dueAt <= today + 3일 |
| OVERDUE (🔴) | dueAt < today                 |

---

## 관련 문서

- [Concept Library](../../03-product/pages/concept-library.md)
- [Personalization SRS](../backend/personalization-srs.md)
