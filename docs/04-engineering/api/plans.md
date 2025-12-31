# Plans API

## 개요

학습 계획(Plan)의 생성, 조회, 상태 변경 API입니다.

---

## 엔드포인트

### Plan 목록 조회

```
GET /api/spaces/{spaceId}/plans
```

**Query Parameters**: page, limit, status (ACTIVE/PAUSED/ARCHIVED/COMPLETED)

**Response** (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "React 마스터 과정",
      "status": "ACTIVE",
      "goalType": "WORK",
      "progress": { "completedSessions": 5, "totalSessions": 20 }
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20 }
}
```

### Plan 상세 조회

```
GET /api/plans/{planId}
```

### Plan 생성

```
POST /api/spaces/{spaceId}/plans
```

**Request Body**:

```json
{
  "materialIds": ["uuid1", "uuid2"],
  "goalType": "WORK",
  "currentLevel": "INTERMEDIATE",
  "targetDueDate": "2025-03-01",
  "specialRequirements": "주말 제외"
}
```

**제약**: materialIds 1~5개, 모두 READY 상태, Space당 ACTIVE 1개

### Plan 상태 변경

```
PATCH /api/plans/{planId}/status
```

**Request**: `{ "status": "PAUSED" }`

**허용 전이**: ACTIVE → PAUSED/ARCHIVED, PAUSED → ACTIVE/ARCHIVED

### Plan Active 설정

```
POST /api/plans/{planId}/activate
```

기존 Active Plan은 자동 PAUSED

### Plan 삭제

```
DELETE /api/plans/{planId}
```

GC 트리거됨

---

## Active Plan 제약

- Space당 1개 Active Plan만 허용
- Active Plan만 Home 큐 표시
- 새 생성 시 기존 Active는 PAUSED

---

## 에러 코드

| 코드                    | HTTP | 설명             |
| ----------------------- | ---- | ---------------- |
| PLAN_NOT_FOUND          | 404  | Plan 없음        |
| PLAN_ALREADY_ACTIVE     | 409  | Active Plan 존재 |
| PLAN_MATERIAL_NOT_READY | 400  | 자료 미완료      |
| PLAN_MATERIAL_LIMIT     | 400  | 5개 초과         |

---

## 관련 문서

- [Plan 시스템](../../03-product/features/plan-system.md)
- [Plan Generation](../backend/plan-generation.md)
