# Server State Management

## 개요

TanStack Query 사용 범위, 캐시 키 규칙, optimistic update, 에러/재시도 UX를 정의합니다.

---

## TanStack Query 사용

### 캐시 키 규칙

```typescript
const queryKeys = {
  materials: {
    all: (spaceId: string) => ["materials", spaceId] as const,
    detail: (id: string) => ["materials", "detail", id] as const,
  },
  plans: {
    all: (spaceId: string) => ["plans", spaceId] as const,
    detail: (id: string) => ["plans", "detail", id] as const,
  },
  home: {
    queue: () => ["home", "queue"] as const,
  },
};
```

### staleTime 설정

| 데이터  | staleTime | 근거                   |
| ------- | --------- | ---------------------- |
| 목록    | 30초      | 자주 변경 가능         |
| 상세    | 1분       | 상세 조회 중 변경 적음 |
| Home 큐 | 10초      | 실시간성 필요          |

---

## Optimistic Update

### 예시: Material 삭제

```typescript
useMutation({
  mutationFn: deleteMaterial,
  onMutate: async (materialId) => {
    await queryClient.cancelQueries({
      queryKey: queryKeys.materials.all(spaceId),
    });
    const previous = queryClient.getQueryData(queryKeys.materials.all(spaceId));

    queryClient.setQueryData(queryKeys.materials.all(spaceId), (old) =>
      old.filter((m) => m.id !== materialId),
    );

    return { previous };
  },
  onError: (err, _, context) => {
    queryClient.setQueryData(
      queryKeys.materials.all(spaceId),
      context.previous,
    );
    toast.error("삭제에 실패했습니다");
  },
});
```

---

## 에러/재시도

### 기본 설정

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 에러 UX

- 401/403: 로그인 페이지 이동
- 500: 재시도 버튼 표시
- 네트워크: 자동 재시도 + 알림

---

## 관련 문서

- [App Architecture](./app-architecture.md)
- [에러 코드](../api/errors.md)
