# Access Control 정책

## 개요

리소스별 소유권 검증 규칙 및 권한 체크 표준을 정의합니다. 모든 리소스는 사용자(User)에게 직접 귀속되며, Space 계층은 제거되었습니다.

---

## 권한 모델

### 현재 (MVP): 소유자 단일 모델

- 모든 리소스는 단일 User에게 소속됩니다.
- 공유나 협업 기능은 현재 지원하지 않습니다.

```
User (1) ─── owns ───> Material (N)
User (1) ─── owns ───> Plan (N)
User (1) ─── owns ───> Session Run (N)
```

---

## 검증 규칙

### 리소스 소유권 검증 (예: Material)

```typescript
async function validateMaterialOwnership(userId: string, materialId: string) {
  const material = await db
    .select()
    .from(materials)
    .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
    .limit(1);

  if (!material.length) {
    throw new AppError("MATERIAL_ACCESS_DENIED", 403);
  }
  return material[0];
}
```

### 리소스별 검증 경로

| 리소스     | 검증 경로             |
| ---------- | --------------------- |
| Material   | Material → User       |
| Plan       | Plan → User           |
| Session    | Session → Plan → User |
| ChatThread | Thread → User         |

---

## 미들웨어 적용

이제 공통된 `/api/spaces/:spaceId` 경로가 없으므로, 각 엔드포인트 핸들러 내에서 또는 리소스 ID가 포함된 경로에 대해 개별적으로 소유권 검증을 수행합니다.

```typescript
// 예: 특정 Plan 접근 시
app.get("/api/plans/:planId", async (c) => {
  const userId = c.get("user").id;
  const planId = c.req.param("planId");

  const plan = await validatePlanOwnership(userId, planId);
  // ... 로직 수행
});
```

---

## 관련 문서

- [인증 API](../api/auth.md)
- [데이터 모델](../data-models.md)
