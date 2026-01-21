---
description: usecase를 Go 스타일 에러 핸들링으로 마이그레이션
---

# UseCase 마이그레이션 가이드

## 목표

andThen 체이닝 → Go 스타일 (async/await + 조기반환)

## 규칙

- `let` 금지 → `const`만 사용
- `try/catch` 금지 → zod는 `safeParse` 사용
- IIFE 금지

## 패턴

### 함수 시그니처

```typescript
export async function myUseCase(
  input: InputType,
): Promise<Result<OutputType, AppError>> {
```

### 입력 검증 (zod)

```typescript
const parseResult = MyInputSchema.safeParse(input);
if (!parseResult.success) {
  return err(new ApiError(400, "VALIDATION_ERROR", parseResult.error.message));
}
const validated = parseResult.data;
```

### 에러 처리 (조기반환)

```typescript
const result = await someRepository.find(...);
if (result.isErr()) return err(result.error);
const data = result.value;
```

### 성공 반환

```typescript
return ok({ id: data.id, name: data.name });
```

## 복잡한 로직 분리

같은 파일 내 헬퍼 함수로 분리:

```typescript
async function handleSubTask(...): Promise<Result<T, AppError>> {
  // 로직
}
```

## 호출부

`handleResult`가 `Promise<Result<...>>`와 `ResultAsync` 모두 지원:

```typescript
return handleResult(myUseCase(input), (value) => c.json(value));
```

## 체크리스트

- [ ] `let` → `const`
- [ ] `try/catch` → `safeParse`
- [ ] andThen 체이닝 → 조기반환
- [ ] IIFE 제거
- [ ] 반환 타입: `Promise<Result<T, AppError>>`
