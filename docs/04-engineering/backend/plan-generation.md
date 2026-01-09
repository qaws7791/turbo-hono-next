# Plan Generation

## 개요

커리큘럼 생성 파이프라인: 입력 스키마, 결과 스키마, 생성 실패/재시도 처리를 정의합니다.

---

## 입력

```typescript
interface PlanGenerationInput {
  materialIds: string[];
  goalType: "JOB" | "CERT" | "WORK" | "HOBBY" | "OTHER";
  goalText?: string;
  currentLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  targetDueDate: string;
  specialRequirements?: string;
}
```

---

## 생성 파이프라인

```mermaid
flowchart LR
    A[입력 검증] --> B[문서 청크 검색]
    B --> C[LLM 커리큘럼 생성]
    C --> D[결과 파싱/검증]
    D --> E[DB 저장]
```

---

## LLM 프롬프트

```
당신은 학습 커리큘럼 설계 전문가입니다.

학습 목표: {goalType} - {goalText}
현재 수준: {currentLevel}
목표 기한: {targetDueDate}
특별 요구사항: {specialRequirements}

제공된 문서 내용을 바탕으로 학습 커리큘럼을 생성하세요.

출력 형식 (JSON):
{
  "title": "Plan 제목",
  "modules": [
    {
      "title": "Module 제목",
      "sessions": [
        { "title": "Session 제목", "type": "LEARN", "estimatedMinutes": 25 }
      ]
    }
  ]
}
```

---

## 결과 스키마

```typescript
interface GeneratedPlan {
  title: string;
  modules: {
    title: string;
    description: string;
    sessions: {
      title: string;
      type: "LEARN";
      estimatedMinutes: number;
      scheduledForDate: string;
    }[];
  }[];
}
```

---

## 실패 처리

| 실패 유형    | 재시도 | 동작        |
| ------------ | ------ | ----------- |
| LLM API 오류 | 2회    | 지수 백오프 |
| 파싱 실패    | 1회    | 다시 생성   |
| 검증 실패    | 0회    | FAILED 마킹 |

---

## 관련 문서

- [Plans API](../api/plans.md)
- [Plan 시스템](../../03-product/features/plan-system.md)
