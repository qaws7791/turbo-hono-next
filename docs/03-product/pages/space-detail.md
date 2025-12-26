# Space 상세 (/spaces/:spaceId)

## 개요

Space 상세는 **단일 학습 의도/목표의 컨테이너**입니다. Space 안에서 문서 업로드, Plan 생성/관리, 개념(지식 아카이브)을 탭으로 전환하며 운영합니다.

---

## 의사결정 근거

- Space는 한 가지 학습 목표의 맥락을 고정해 혼재를 줄임
- Space 내부에서 문서/계획/개념이 함께 돌아야 흐름이 단순해짐
- 탭 구조로 기능을 묶어 이동 비용을 낮춤

---

## 구성 요소 (탭 구조)

### 탭 네비게이션

```
[학습 계획] [문서] [개념]
```

---

## 1) 학습 계획 탭 (기본)

**목적**: Plan 목록 확인 및 새 Plan 생성

> 상세 기획은 [Plans 페이지](./plans.md) 참조

### 주요 기능

- Plan 목록 보기
- “학습 계획 만들기” 진입
- Plan 클릭 시 → Plan 상세로 이동

---

## 2) 문서 탭

**목적**: 학습 자료 업로드 및 관리

> 상세 기획은 [Documents 페이지](./documents.md) 참조

### 주요 기능

- 자료 목록 확인(요약/태그/상태)
- 자료 업로드(파일/URL/텍스트)
- 삭제

---

## 3) 개념 탭

**목적**: 해당 Space에서 생성된 Concept 목록 확인

> 전역 아카이브는 [Concept Library](./concept-library.md) 참조

### 주요 기능

- Space에 속한 Concept 카드 목록
- 간단 검색
- Concept 클릭 시 → Concept 상세로 이동

---

## UI 원칙

### 헤더

- 상단에 Space 이름 표시
- Space 아이콘/색상은 Space 상세 화면에서 즉시 변경 가능

### Space 전환

- 전역 사이드바의 Space 목록을 통해 전환

### 일관성

- 모든 탭에서 동일한 레이아웃 패턴 유지
- “학습 계획” 탭이 기본 진입 화면

---

## 라우팅

| 경로                            | 설명               |
| ------------------------------- | ------------------ |
| `/spaces/:spaceId`              | 학습 계획 탭(기본) |
| `/spaces/:spaceId/documents`    | 문서 탭            |
| `/spaces/:spaceId/concepts`     | 개념 탭            |
| `/spaces/:spaceId/plans/new`    | Plan 생성 위저드   |
| `/spaces/:spaceId/plan/:planId` | Plan 상세          |

### 탭 쿼리(호환)

기존 링크 호환을 위해 아래 형태는 각 탭 경로로 자동 이동합니다.

- `/spaces/:spaceId?tab=plans` → `/spaces/:spaceId`
- `/spaces/:spaceId?tab=documents` → `/spaces/:spaceId/documents`
- `/spaces/:spaceId?tab=concepts` → `/spaces/:spaceId/concepts`
