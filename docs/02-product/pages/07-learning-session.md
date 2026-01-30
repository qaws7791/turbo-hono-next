# 풀스크린 학습 세션 모드 (/session)

## 개요

학습은 홈에서 시작되지만, 실제 학습은 **몰입형 풀스크린 세션 화면**에서 진행됩니다. 별도 '페이지'로 늘리지 않고 "모드(View)"로 제공하여 구조는 단순하게 유지합니다. React Router의 `/session` 라우트와 `domains/session` 도메인 로직을 통해 구현되어 있습니다.

---

## 의사결정 근거

- **Cognitive Load Theory**: 몰입을 위해 주변 요소를 제거해야 함
- **Flow**: 학습은 '흐름'이므로 단계형 인터랙션(Step-by-Step) 필요
- **Low Friction**: 진단을 세션에 녹여 넣어 심리적 부담을 낮춤 (Implicit Assessment)

---

## 데이터 모델 및 아키텍처

학습 세션은 두 가지 핵심 모델로 구성됩니다.

### 1. SessionBlueprint (청사진)

학습 세션의 정적 정의입니다. 학습 전문가(또는 AI)가 설계한 세션의 구조를 담고 있습니다.

- `steps`: 세션을 구성하는 단계들의 배열
- `timeBudget`: 예상 소요 시간 (Micro, Standard, Deep 프로파일)
- `startStepId`: 시작 단계 ID

### 2. SessionRun (실행)

사용자가 특정 Blueprint를 실제로 수행하는 인스턴스입니다.

- `runId`: 실행 고유 ID
- `inputs`: 사용자의 입력값 (답안, 플래시카드 뒤집기 여부 등)
- `stepHistory`: 사용자가 거쳐온 단계들의 기록
- `status`: ACTIVE, COMPLETING, COMPLETED

---

## 세션 단계 구성 (Supported Step Types)

코드베이스(`SessionStepType`)에 구현된 실제 지원 단계는 다음과 같습니다.

| 타입                | 설명         | 사용자 인터랙션                  |
| ------------------- | ------------ | -------------------------------- |
| **SESSION_INTRO**   | 세션 도입    | 목표, 예상 시간, 선수 지식 안내  |
| **LEARN_CONTENT**   | 개념 학습    | 마크다운 기반 텍스트/이미지 학습 |
| **CHECK**           | 객관식 확인  | 4지 선다형 퀴즈                  |
| **CLOZE**           | 빈칸 채우기  | 문장 내 빈칸 채우기              |
| **MATCHING**        | 짝대기 연결  | 개념과 정의 연결하기             |
| **FLASHCARD**       | 플래시카드   | 앞/뒤면 뒤집기 및 암기 여부 체크 |
| **SPEED_OX**        | 스피드 O/X   | 빠르게 O/X 판단하기              |
| **APPLICATION**     | 적용 문제    | 시나리오 기반 실전 문제          |
| **SESSION_SUMMARY** | 완료 및 요약 | 학습 결과 요약 및 종료           |

---

## 세션 로직 (Client-Side Logic)

클라이언트(`domains/session`)에서는 `SessionController`가 상태 머신 역할을 수행합니다.

### 상태 관리

- `useSessionController` 훅이 `SessionRun` 상태를 관리합니다.
- `predictedPath` 알고리즘을 통해 남은 단계를 예측하고 진행률(Progress Bar)을 계산합니다.
- 분기(Branching) 로직을 지원하여, 정답 여부에 따라 다음 단계가 달라질 수 있는 구조를 갖추고 있습니다.

### UI 원칙

1.  **단일 집중**: 한 번에 하나의 Step만 표시
2.  **흐름 중심**: "다음(Next)" 버튼 중심의 선형적 경험 제공
3.  **크롬 최소화**: 상단 GNB, 사이드바를 제거하고 세션 전용 헤더 사용

---

## 와이어프레임

```
┌────────────────────────────────────────┐
│ ←  Step 1/5  ██████░░░░░░  20%    │
├────────────────────────────────────────┤
│                                        │
│                                        │
│     📖 학습 주제 이해하기               │
│                                        │
│     [MarkDown Content Area]            │
│     # 핵심 개념                        │
│     설명 텍스트...                      │
│                                        │
│                                        │
│                                        │
├────────────────────────────────────────┤
│                                        │
│           [다음 →]                      │
│                                        │
└────────────────────────────────────────┘
```

---

## 세션 복구 및 저장 (Session Recovery)

코드베이스에는 학습 중단 방지와 데이터 보존을 위한 메커니즘이 구현되어 있습니다.

### 구현된 메커니즘

1.  **Auto-Save (자동 저장)**
    - `useDebouncedEffect`를 통해 3초마다 또는 주요 액션(Next 이동 등) 발생 시 서버에 진행 상황을 저장합니다.
    - **API**: `PATCH /api/session-runs/{runId}/progress`
    - 저장 데이터: 현재 Step Index, 사용자 입력값(Inputs)

2.  **Session Resume (이어하기)**
    - 사용자가 `/session`에 진입할 때 `RunConfig`에 따라 기존 세션을 불러옵니다(`initFromRun`).
    - 이전에 입력했던 답안(Answers), 플래시카드 상태 등이 그대로 복원됩니다.

3.  **완료 처리**
    - 마지막 단계 도달 시 `completeSessionRun` API를 호출하여 세션을 종료(`COMPLETED`) 처리합니다.
