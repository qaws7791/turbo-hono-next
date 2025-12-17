# Session Mode State

## 개요

풀스크린 세션 모드의 상태 모델, 스텝 관리, 중단/재개 처리를 정의합니다.

---

## 상태 모델

```typescript
interface SessionModeState {
  runId: string;
  sessionId: string;
  isRecovery: boolean;

  currentStep: number;
  totalSteps: number;

  steps: StepData[];
  inputs: Record<string, any>;

  status: "LOADING" | "ACTIVE" | "COMPLETING" | "COMPLETED";
}

type StepData =
  | { type: "LEARN"; content: string }
  | { type: "CHECK"; question: string; options: string[] }
  | { type: "PRACTICE"; prompt: string }
  | { type: "COMPLETE"; summary: string };
```

---

## 상태 관리

### useReducer 사용

```typescript
function sessionReducer(state: SessionModeState, action: SessionAction) {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, currentStep: state.currentStep + 1 };
    case "SET_INPUT":
      return {
        ...state,
        inputs: { ...state.inputs, [action.key]: action.value },
      };
    case "COMPLETE":
      return { ...state, status: "COMPLETED" };
    default:
      return state;
  }
}
```

---

## 중간 저장

### 저장 트리거

- 스텝 전환 시
- 입력 변경 시 (debounce 3초)

```typescript
useEffect(() => {
  const save = debounce(() => {
    saveProgress({ stepIndex: state.currentStep, inputs: state.inputs });
  }, 3000);

  save();
  return () => save.cancel();
}, [state.inputs, state.currentStep]);
```

---

## 렌더 성능

### 최적화

- 스텝별 컴포넌트 분리
- React.memo 적용
- 불필요한 리렌더 방지

---

## 관련 문서

- [풀스크린 학습 세션](../../03-product/pages/learning-session.md)
- [Sessions API](../api/sessions.md)
