# 정보 구조 (Information Architecture)

## 개요

이 문서는 플랫폼의 전체 정보 구조(IA)와 페이지 계층, 주요 라우트를 정의합니다.

---

## 전체 구조

```
0) 랜딩 (/) - 마케팅/전환
   └─ 로그인 (/login) - 인증

1) 홈 (/home) - 전역 허브
   └─ 오늘 할 일 (/today) - 오늘 큐 전체 보기

2) 스페이스 (/spaces) - 학습 공간 목록/생성
   └─ Space 상세 (/spaces/:spaceId) - 탭 구조
       ├─ 학습 계획 (기본) (/spaces/:spaceId)
       │   └─ Plan 상세 (/spaces/:spaceId/plan/:planId)
       ├─ 문서 (/spaces/:spaceId/documents)
       └─ 개념 (/spaces/:spaceId/concepts)

3) Plan 생성 위저드 (/spaces/:spaceId/plans/new)

4) 전역 개념 라이브러리 (/concepts)
   └─ Concept 상세 (/concept/:conceptId)

5) 학습 세션 (/session) - 풀스크린 모드

6) 설정 - Dialog (별도 페이지 아님)
```

---

## 페이지 계층

### Level 0: 외부 페이지

| 경로     | 페이지 | 목적        |
| -------- | ------ | ----------- |
| `/`      | 랜딩   | 마케팅/전환 |
| `/login` | 로그인 | 인증        |

### Level 1: 앱 메인 페이지

| 경로        | 페이지          | 목적                  |
| ----------- | --------------- | --------------------- |
| `/home`     | 홈              | 전역 허브, 할 일 관리 |
| `/today`    | 오늘 할 일      | 오늘 큐 전체 보기     |
| `/spaces`   | Spaces 목록     | 학습 공간 관리        |
| `/concepts` | Concept Library | 전역 개념 아카이브    |
| `/session`  | 학습 세션       | 풀스크린 학습 모드    |

### Level 2: Space 내부 페이지

| 경로                            | 페이지     | 목적                  |
| ------------------------------- | ---------- | --------------------- |
| `/spaces/:spaceId`              | Space 상세 | 탭으로 하위 내용 관리 |
| `/spaces/:spaceId/documents`    | 문서       | 자료 업로드/관리      |
| `/spaces/:spaceId/concepts`     | 개념       | Space별 개념 목록     |
| `/spaces/:spaceId/plans/new`    | Plan 생성  | 3단계 위저드          |
| `/spaces/:spaceId/plan/:planId` | Plan 상세  | 실행/진행/커리큘럼    |

### Level 3: 상세 페이지

| 경로                  | 페이지       | 목적           |
| --------------------- | ------------ | -------------- |
| `/concept/:conceptId` | Concept 상세 | 개념 상세 보기 |

---

## 네비게이션 구조

### 전역 네비게이션 (사이드바)

- 홈: `/home`
- 오늘 할 일: `/today`
- 검색: 커맨드 팔레트(단축키 `Cmd/Ctrl + K`)
- 개념 라이브러리: `/concepts`
- 스페이스: `/spaces` + 내가 가진 Space 목록(바로가기)
- 사용자 메뉴(하단): 설정(단축키 `Cmd/Ctrl + ,`), 로그아웃

### Space 내부 탭 네비게이션

```
[학습 계획] [문서] [개념]
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
- 예: `/spaces` (목록), `/spaces/:spaceId` (상세)

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

| 페이지             | Space 적용                                                |
| ------------------ | --------------------------------------------------------- |
| 홈 (Home)          | 전역 집계: 모든 Space의 Active Plan 할 일                 |
| 오늘 할 일 (Today) | 전역 집계: 오늘 할 일 전체 목록                           |
| Spaces             | Space 목록/생성/관리 허브                                 |
| Space 상세         | 해당 Space의 문서/계획/개념                               |
| Plan 상세          | 선택된 Plan의 실행/진행/커리큘럼                          |
| Concept Library    | 전역 아카이브(기본) + Space 내부에는 Space별 개념 탭 제공 |

---

## 관련 문서

- [사용자 플로우](./user-flow.md)
- [페이지별 상세 기획](./pages/)
- [기능별 상세 기획](./features/)
