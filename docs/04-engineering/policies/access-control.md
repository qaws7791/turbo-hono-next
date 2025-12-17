# Access Control 정책

## 개요

user/space 소유권 검증 규칙, 리소스별 권한 체크 표준을 정의합니다.

---

## 권한 모델

### 현재 (MVP): 소유자 단일 모델

- 모든 리소스는 단일 user에게 소속
- 공유/협업 없음

```
User (1) ─── owns ───> Space (N)
Space (1) ─── contains ───> Material, Plan, Concept
```

---

## 검증 규칙

### Space 소유권

```typescript
async function validateSpaceOwnership(userId: string, spaceId: string) {
  const space = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.id, spaceId), eq(spaces.userId, userId)))
    .limit(1);

  if (!space.length) {
    throw new AppError("SPACE_ACCESS_DENIED", 403);
  }
  return space[0];
}
```

### 리소스 권한

| 리소스     | 검증 경로                     |
| ---------- | ----------------------------- |
| Material   | Material → Space → User       |
| Plan       | Plan → Space → User           |
| Session    | Session → Plan → Space → User |
| Concept    | Concept → Space → User        |
| ChatThread | Thread → User                 |

---

## 미들웨어 적용

```typescript
// Space 레벨 권한
app.use("/spaces/:spaceId/*", async (c, next) => {
  const userId = c.get("user").id;
  const spaceId = c.req.param("spaceId");
  await validateSpaceOwnership(userId, spaceId);
  await next();
});
```

---

## 관련 문서

- [인증 API](../api/auth.md)
