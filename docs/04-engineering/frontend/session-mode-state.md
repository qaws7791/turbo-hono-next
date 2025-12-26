# Session Mode State (Prototype)

## 개요

`/session` 풀스크린 학습 모드의 상태 모델, 스텝 전이, 중단/재개, 중간 저장 규칙을 정리합니다.

---

## 상태 모델

프로토타입은 세션 실행을 “스케줄(Session)”과 “실행 기록(SessionRun)”으로 분리하고, UI는 `SessionUiState`를 중심으로 동작합니다.

핵심 필드:

- `runId / planId / sessionId`
- `blueprint`: 세션 스텝 정의(시작 스텝, 스텝 리스트)
- `currentStepId`, `stepHistory`, `historyIndex`
- `inputs`: 스텝별 입력(선택/연결/플래시카드 결과 등)
- `status`: `ACTIVE | COMPLETING | COMPLETED`
- `isRecovery`: 기존 실행 복구 여부
- `createdConceptIds`: 완료 시 생성된 Concept ID

실제 타입 정의: `apps/web/app/features/session/types.ts`

---

## 스텝 타입

프로토타입 세션은 아래 스텝 타입을 조합해 구성합니다.

- `SESSION_INTRO`
- `CONCEPT` (Markdown)
- `CHECK` (4지선다)
- `CLOZE` (빈칸 4지선다)
- `MATCHING` (연결)
- `FLASHCARD`
- `SPEED_OX`
- `APPLICATION` (적용 문제)
- `SESSION_SUMMARY`

스텝 타입 스키마: `apps/web/app/mock/schemas.ts` (`SessionStepTypeSchema`)

---

## 전이(Next/Prev)

- `Prev`: `stepHistory/historyIndex` 기반으로 이전 스텝으로 이동
- `Next`: 현재 스텝의 입력이 “진행 가능” 조건을 만족할 때만 이동
- `SESSION_SUMMARY` 진입 직전에 완료 처리를 수행(Concept 생성/세션 완료 마킹)

구현: `apps/web/app/features/session/use-session-controller.ts`

---

## 중간 저장(Autosave)

### 저장 트리거

- 입력 변경 후 debounce(기본 3초)
- 사용자가 세션을 종료/이탈할 때 즉시 저장

### 저장 내용

- `currentStepId`
- `stepHistory`, `historyIndex`
- `inputs`(검증된 형태로만)

---

## 복구(Recovery)

- 동일한 `planId + sessionId`로 완료되지 않은 `SessionRun`이 있으면 재사용
- 재진입 시 `isRecovery`를 true로 표시해 “복구” 상태를 UI에 노출
