# Plans API

## 개요

학습 계획(Plan)의 생성, 조회, 상태 변경 API입니다. 모든 학습 계획은 사용자의 계정 내에서 전역적으로 관리됩니다.

---

## 엔드포인트

### Plan 목록 조회

```
GET /api/plans
```

**Query Parameters**:

| 파라미터 | 타입   | 기본값 | 설명                                      |
| -------- | ------ | ------ | ----------------------------------------- |
| page     | number | 1      | 페이지 번호                               |
| limit    | number | 20     | 페이지당 개수                             |
| status   | string | -      | 필터: ACTIVE, PAUSED, ARCHIVED, COMPLETED |

**Response** (200):

```json
{
  "data": [
    {
      "id": "public_id",
      "title": "React 마스터 과정",
      "icon": "target",
      "color": "blue",
      "status": "ACTIVE",
      "goalType": "WORK",
      "currentLevel": "INTERMEDIATE",
      "progress": {
        "completedSessions": 5,
        "totalSessions": 20
      },
      "createdAt": "2025-01-15T09:00:00Z",
      "updatedAt": "2025-01-15T09:00:00Z",
      "sourceMaterialIds": ["uuid1", "uuid2"]
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20 }
}
```

### Plan 상세 조회

```
GET /api/plans/{planId}
```

**Response** (200):

```json
{
  "data": {
    "id": "public_id",
    "title": "React 마스터 과정",
    "icon": "target",
    "color": "blue",
    "status": "ACTIVE",
    "goalType": "WORK",
    "currentLevel": "INTERMEDIATE",
    "targetDueDate": "2025-03-01",
    "specialRequirements": "주말 제외",
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-01-15T09:00:00Z",
    "progress": { "completedSessions": 5, "totalSessions": 20 },
    "sourceMaterialIds": ["uuid1", "uuid2"],
    "modules": [
      {
        "id": "uuid",
        "title": "Module 1: Foundations",
        "description": "기초 개념 정리",
        "orderIndex": 0
      }
    ],
    "sessions": [
      {
        "id": "public_id",
        "moduleId": "uuid",
        "sessionType": "LEARN",
        "title": "Session 1: Introduction",
        "orderIndex": 0,
        "scheduledForDate": "2025-01-16",
        "estimatedMinutes": 30,
        "status": "SCHEDULED"
      }
    ]
  }
}
```

### Plan 생성

```
POST /api/plans
```

**Request Body**:

```json
{
  "materialIds": ["uuid1", "uuid2"],
  "goalType": "WORK",
  "currentLevel": "INTERMEDIATE",
  "targetDueDate": "2025-03-01",
  "specialRequirements": "주말 제외",
  "title": "선택적 제목",
  "icon": "선택적 아이콘",
  "color": "선택적 색상"
}
```

**제약**:

- `materialIds`: 1~5개, 모두 `READY` 상태여야 함.
- 사용자당 **ACTIVE 상태의 Plan은 1개**만 권장됩니다.

### Plan 상태 변경

```
PATCH /api/plans/{planId}/status
```

**Request**: `{ "status": "PAUSED" }`

**허용 전이**:

- ACTIVE → PAUSED / ARCHIVED / COMPLETED
- PAUSED → ACTIVE / ARCHIVED / COMPLETED

### Plan Active 설정

```
POST /api/plans/{planId}/activate
```

특정 Plan을 활성화합니다. 기존에 `ACTIVE` 상태였던 다른 Plan은 자동으로 `PAUSED` 상태로 변경됩니다.

### Plan 삭제

```
DELETE /api/plans/{planId}
```

학습 계획을 삭제합니다. 관련 없는 학습 자료들은 유지되나, 더 이상 참조되지 않는 자료는 정해진 정책에 따라 정리(GC)될 수 있습니다.

---

## Active Plan 정책

- **단일 활성화**: 사용자는 한 번에 하나의 계획에 집중하는 것을 권장하며, 시스템은 `ACTIVE` Plan을 큐의 최상단에 배치합니다.
- **Home 큐**: `ACTIVE` 상태인 Plan의 예정된 세션들이 홈 화면의 할 일 목록에 표시됩니다.
- **자동 전환**: 새 Plan을 생성하거나 특정 Plan을 `activate`하면 기존 활성 계획은 자동으로 `PAUSED` 처리됩니다.

---

## 에러 코드

| 코드                    | HTTP | 설명                                            |
| ----------------------- | ---- | ----------------------------------------------- |
| PLAN_NOT_FOUND          | 404  | 요청한 Plan을 찾을 수 없음                      |
| PLAN_MATERIAL_NOT_READY | 400  | 포함된 자료 중 분석이 완료되지 않은 자료가 있음 |
| PLAN_MATERIAL_LIMIT     | 400  | 선택된 자료가 5개를 초과함                      |

---

## 관련 문서

- [Plan 시스템](../../03-product/features/plan-system.md)
- [Plan 상세 페이지](../../03-product/pages/plan-detail.md)
- [시스템 아키텍처](../architecture.md)
