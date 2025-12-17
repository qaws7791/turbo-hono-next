# 정보 구조 (Information Architecture)

## 개요

이 문서는 플랫폼의 전체 정보 구조와 페이지 계층을 정의합니다.

---

## 전체 구조

```
0) 랜딩 페이지 (/) — 마케팅/전환
   └─ 로그인 페이지 (/login) — 인증

1) 홈 (Home) (/home) — 전역 허브

2) 공간 (Spaces)
   └─ Space 목록 (/spaces)
   └─ Space 상세 (/spaces/:id)
       ├─ Overview 탭
       ├─ Documents 탭
       ├─ Plans 탭
       │   └─ Plan 상세 (/spaces/:spaceId/plan/:planId)
       └─ Concepts 탭
           └─ Concept 상세 (/concept/:id)

3) Plan 생성 위저드 (/spaces/:spaceId/plans/new)

4) 학습 세션 (/session) — 풀스크린 모드

5) 설정 — Dialog (별도 페이지 아님)
```

---

## 페이지 계층

### Level 0: 외부 페이지

| 경로     | 페이지 | 목적        |
| -------- | ------ | ----------- |
| `/`      | 랜딩   | 마케팅/전환 |
| `/login` | 로그인 | 인증        |

### Level 1: 앱 메인 페이지

| 경로       | 페이지      | 목적                  |
| ---------- | ----------- | --------------------- |
| `/home`    | 홈          | 전역 허브, 할 일 관리 |
| `/spaces`  | Spaces 목록 | 학습 공간 관리        |
| `/session` | 학습 세션   | 풀스크린 학습 모드    |

### Level 2: Space 내부 페이지

| 경로                            | 페이지     | 목적                  |
| ------------------------------- | ---------- | --------------------- |
| `/spaces/:id`                   | Space 상세 | 탭으로 하위 내용 관리 |
| `/spaces/:spaceId/plans/new`    | Plan 생성  | 위저드 형태           |
| `/spaces/:spaceId/plan/:planId` | Plan 상세  | 운영 콘솔             |

### Level 3: 상세 페이지

| 경로           | 페이지       | 목적           |
| -------------- | ------------ | -------------- |
| `/concept/:id` | Concept 상세 | 개념 상세 보기 |

---

## 네비게이션 구조

### 전역 네비게이션 (사이드바)

```
┌──────────────────────────────────┐
│ [Logo]        ←사이드바 닫기 │
│ 🏠 Home                    │ <- /home
│ 🔍 Search          (Cmd+K)│ <- 전역 검색
│ --------------------------- │
│ 📚 Spaces               [+]│ <- Spaces 목록 헤더 + 생성 버튼
│  ├─ Work                    │
│  ├─ Hobby                   │
│  └─ ...                     │
│                             │
│          (Scroll)           │
│                             │
│ --------------------------- │
│ 👤 [User Profile Info]      │ <- 사용자 정보 (하단 고정)
│ ⚙️ Settings                 │ <- 설정 버튼 (하단 고정)
└────────────────────────────────────┘
```

### Space 내부 탭 네비게이션

```
[Overview] [Documents] [Plans] [Concepts]
```

### Plan 상세 섹션

```
Header | Today Queue | Progress | Path | Versions
```

---

## URL 설계 원칙

### 1. 계층 반영

- URL이 정보 계층을 반영
- 예: `/spaces/:spaceId/plan/:planId`

### 2. 명확한 리소스

- 리소스 타입이 URL에 명시
- 예: `/spaces`, `/concept`, `/session`

### 3. 일관성

- 복수형은 목록, 단수형/ID는 상세
- 예: `/spaces` (목록), `/spaces/:id` (상세)

---

## Space 분리 설계

### Space의 정의

**Space = "한 가지 학습 의도/목표"를 담는 컨테이너**

### Space 내 종속 리소스

- Documents (업로드 자료)
- Plans (여러 개 가능, Active Plan은 1개 권장)
- Sessions (세션 로그)
- Concepts (지식 아카이브)

### 페이지별 Space 적용

| 페이지          | Space 적용                           |
| --------------- | ------------------------------------ |
| 홈 (Home)       | 전역 집계: 모든 Space of Active Plan |
| Spaces          | Space 목록/생성/관리 허브            |
| Space 상세      | 해당 Space의 모든 리소스             |
| Plan 상세       | 선택된 Plan의 실행/진행/경로         |
| Concept Library | 기본은 현재 Space, 전체 토글 옵션    |

---

## 관련 문서

- [페이지별 상세 기획](./pages/)
- [기능별 상세 기획](./features/)
