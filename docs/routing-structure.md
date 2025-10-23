# Routing Structure

> 모든 Params/Query 스키마는 `zod` v4 기준으로 표현됩니다.

## Home

- Path: `/`
  - Name: `Home`
  - Description: 퍼블릭 랜딩 페이지로 서비스 소개 및 CTA를 제공한다.
  - Params: 없음
  - Query: 없음

## Login

- Path: `/login`
  - Name: `Login`
  - Description: 이메일·비밀번호 기반 로그인 폼과 소셜 액션을 담은 인증 진입 페이지다.
  - Params: 없음
  - Query:
    ```ts
    z.object({
      redirect: z.string().trim().catch("/app").default("/app"),
    });
    ```

    - `redirect`: 로그인 성공 후 이동할 경로 (미설정·유효하지 않은 값은 `/app`으로 강제)

## App

- Path: `/app`
  - Name: `Dashboard`
  - Description: 인증된 사용자의 학습 로드맵 목록, 날짜별 마감·완료 목표 카드 리스트를 포함한 활동 캘린더, 생성 CTA를 제공하는 기본 대시보드다.
  - Params: 없음
  - Query: 없음

## Roadmap Creation

- Path: `/app/create`
  - Name: `RoadmapCreate`
  - Description: 문서 업로드부터 목표 정의까지 이어지는 퍼널 UI로 AI 로드맵 생성을 진행한다.
  - Params: 없음
  - Query: 없음

## Roadmap Detail

- Path: `/app/roadmaps/:roadmapId`
  - Name: `RoadmapDetail`
  - Description: 단일 로드맵의 목표·세부 목표, 문서 정보를 제공하고 상태 변경을 허용한다.
  - Params:
    ```ts
    z.object({
      roadmapId: z.string().length(16, "유효한 로드맵 식별자를 입력하세요."),
    });
    ```

    - `roadmapId`: 로드맵 공개 ID (16자 Nano ID)
  - Query: 없음

## SubGoal Detail

- Path: `/app/roadmaps/:roadmapId/sub-goals/:subGoalId`
  - Name: `SubGoalDetail`
  - Description: 세부 목표의 메타데이터, AI 노트·퀴즈 생성 상태 및 조작 액션을 제공한다.
  - Layout:
    - `개요` 탭: 세부 목표의 기본 정보, 마감 상태, 상위 목표 정보, 활동 기록 및 메모를 표시한다.
    - `AI 노트` 탭: AI 노트 생성 상태, 생성·재생성 액션, 노트 콘텐츠를 제공한다.
    - `AI 학습 퀴즈` 탭: 세부 목표 분량에 맞춰 생성된 객관식 퀴즈를 보여주고, 응답 제출 시 정답/해설을 강조한다.
  - Params:
    ```ts
    z.object({
      roadmapId: z.string().length(16, "유효한 로드맵 식별자를 입력하세요."),
      subGoalId: z.string().uuid("유효한 세부 목표 식별자를 입력하세요."),
    });
    ```

    - `roadmapId`: 상위 로드맵 공개 ID (16자 Nano ID)
    - `subGoalId`: 세부 목표 공개 ID (UUID 포맷)
  - Query:
    ```ts
    z.object({
      tab: z.enum(["overview", "ai-note", "ai-quiz"]).optional(),
    });
    ```

    - `tab`: 활성화할 탭 식별자 (`overview`가 기본 탭)
