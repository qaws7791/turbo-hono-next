# 📚 AI 개인화 학습 플랫폼 문서

> **목표만 말하세요. 나머지는 AI가 합니다.**

AI가 학습 전 과정을 자동으로 설계·운영하는 **개인 학습 운영체제(Learning OS)** 프로젝트 문서입니다.

---

## 📖 문서 구조

### [01. Overview (개요)](./01-overview/)

- [플랫폼 비전](./01-overview/vision.md) - 핵심 가치 제안 및 목표
- [제품 원칙](./01-overview/product-principles.md) - 단순성, 자동화, 개인화 원칙
- [용어집](./01-overview/glossary.md) - 프로젝트 용어 정의

### [02. Product (제품 기획)](./02-product/)

- [사용자 플로우](./02-product/user-flow.md) - 핵심 사용자 여정
- [정보 구조](./02-product/information-architecture.md) - IA 및 네비게이션

#### [페이지별 기획](./02-product/pages/)

- [랜딩 페이지](./02-product/pages/landing.md)
- [로그인](./02-product/pages/login.md)
- [홈 (Home)](./02-product/pages/home.md)
- [오늘 할 일 (Today)](./02-product/pages/today.md)
- [Materials (자료 관리)](./02-product/pages/materials.md)
- [Plans](./02-product/pages/plans.md)
- [Plan 생성 위저드](./02-product/pages/plan-creation-wizard.md)
- [Plan 상세](./02-product/pages/plan-detail.md)
- [학습 세션](./02-product/pages/learning-session.md)
- [설정 (다이얼로그)](./02-product/pages/settings.md)

#### [기능별 기획](./02-product/features/)

- [Plan 시스템](./02-product/features/plan-system.md)

### [03. Design (디자인)](./03-design/)

- [디자인 컨셉](./03-design/design-concept.md) - Calm Focus OS
- [컬러 시스템](./03-design/color-system.md) - 팔레트 및 디자인 토큰
- [타이포그래피](./03-design/typography.md) - 폰트 및 타입 스케일
- [레이아웃](./03-design/layout.md) - 그리드 및 여백 규칙
- [모션](./03-design/motion.md) - 애니메이션 원칙
- [아이콘](./03-design/icons.md) - 아이콘 및 그래픽 가이드
- [접근성](./03-design/accessibility.md) - 접근성 가이드라인

### [04. Engineering (엔지니어링)](./04-engineering/)

- [기술 스택](./04-engineering/tech-stack.md) - 사용 기술 개요
- [시스템 아키텍처](./04-engineering/architecture.md) - 전체 구조
- [데이터 모델](./04-engineering/data-models.md) - 엔티티 및 관계

#### [API](./04-engineering/api/)

#### [Frontend](./04-engineering/frontend/)

#### [Backend](./04-engineering/backend/)

#### [Policies (정책)](./04-engineering/policies/)

- [학습 자료 삭제 정책](./04-engineering/policies/material-deletion.md) - 좀비 데이터 전략

### [05. Operations (운영)](./05-operations/)

- [배포 (Deployment)](./05-operations/deployment/)
- [정책 (Policies)](./05-operations/policies/)

---

## 📄 핵심 개념

| 개념        | 설명                           |
| ----------- | ------------------------------ |
| **Plan**    | 업로드된 문서 기반의 학습 계획 |
| **Session** | 20~40분 단위의 몰입형 학습     |

---

## � 프로젝트 규칙 및 가이드라인

### 0. 용어 통일 원칙 (Ubiquitous Language)

우리는 기획, 디자인, 개발, 그리고 일상 대화에서 **완벽하게 동일한 용어**를 사용합니다.
이는 오해를 줄이고 커뮤니케이션 비용을 최소화하기 위함입니다.

- **Single Source of Truth**: 모든 용어의 정의는 [용어집 (Glossary)](./01-overview/glossary.md)이 기준이 됩니다.
- **실천 가이드**:
  1. **코드 일치**: 기획서의 한글 용어는 코드 내의 영어 변수명/클래스명과 1:1로 대응되어야 합니다. (예: '학습 세션' ↔ `LearningSession`)
  2. **동의어 금지**: 의미가 같다면 반드시 하나의 단어만 사용합니다. (예: `Client`, `Customer`, `User` 중 하나로 통일)
  3. **우선 정의 후 사용**: 새로운 개념이 등장하면 코드를 짜기 전에 용어집에 먼저 정의를 추가합니다.

### 1. 문서 작성 가이드

각 문서는 해당 디렉토리의 성격에 맞게 작성되어야 합니다.

#### [01] Overview (개요)

- **목적**: 프로젝트의 북극성 역할. 모든 결정의 기준점이 됩니다.
- **주요 내용**: 비전, 핵심 가치, 제품 원칙, 전체 로드맵, 용어 정의.
- **독자**: 경영진, PO, 디자이너, 개발자 포함 전사 구성원.
- **작성 원칙**:
  - 누구나 이해할 수 있는 쉬운 용어(Plain Language)를 사용합니다.
  - 구체적인 구현 방법보다는 **방향성**과 **이유(Why)**에 집중합니다.

#### [02] Product (제품 기획)

- **목적**: 개발 및 디자인의 기준이 되는 상세 요구사항 명세.
- **주요 내용**: 사용자 스토리, 플로우차트, 와이어프레임(Lo-Fi), 상세 기능 명세(Specs).
- **독자**: PO, 디자이너, 개발자.
- **작성 원칙**:
  - 사용자 관점(User Perspective)에서 서술합니다.
  - 예외 케이스(Edge Cases)와 에러 처리에 대한 정의를 포함해야 합니다.
  - 디자인/개발 단계에서 모호함이 없도록 구체적인 **인수 조건(AC)**을 명시합니다.

#### [03] Design (디자인)

- **목적**: 시각적 일관성과 사용자 경험의 표준화.
- **주요 내용**: 디자인 시스템, 컬러/타이포그래피 토큰, 컴포넌트 가이드, 인터랙션 정의.
- **독자**: 디자이너, 프론트엔드 개발자.
- **작성 원칙**:
  - 재사용 가능한 컴포넌트와 토큰 위주로 기술합니다.
  - 시각적 예시와 함께 **사용 금지(Do nots)** 사항을 명확히 합니다.

#### [04] Engineering (엔지니어링)

- **목적**: 시스템 구현의 기술적 맥락과 설계 의도를 공유합니다.
- **주요 내용**: 아키텍처 원칙, 기술적 의사결정(ADR), 데이터 모델 설계, 보이지 않는 규칙 및 정책.
- **독자**: 개발자.
- **작성 원칙**:
  - **코드 최소화**: 코드로 설명 가능한 부분은 과감히 생략하고, 코드만으로는 알 수 없는 **설계 의도(Design Intent)**와 **맥락(Context)**에 집중합니다.
  - **결정 근거 기록**: 왜 이 기술/패턴을 선택했는지에 대한 **의사결정 근거(Rationale)**를 명확히 남깁니다.
  - **보이지 않는 규칙**: 코드에 명시적으로 드러나지 않는 시스템의 제약 사항, 암묵적인 규칙, 예외 정책 등을 문서화합니다.

#### [05] Operations (운영)

- **목적**: 서비스의 안정적인 배포, 모니터링, 유지보수 절차 확립.
- **주요 내용**: CI/CD 파이프라인, 인프라 구성(IaC), 모니터링 대시보드, 장애 대응 매뉴얼, 보안/데이터 정책.
- **독자**: DevOps, SRE, 백엔드 개발자.
- **작성 원칙**:
  - 사고 발생 시 즉시 따라 할 수 있는 **매뉴얼(Runbook)** 형태로 작성합니다.
  - 환경 변수나 민감 정보는 문서에 직접 포함하지 않고 참조 방식을 안내합니다.

### 2. 리소스 관리 규칙

- **이미지 에셋**: 모든 이미지는 해당 마크다운 파일과 동일한 위치의 `assets` 폴더에 저장합니다.
- **와이어프레임**: 복잡함을 피하기 위해 ASCII 아트 대신 스케치 스타일의 단순한 로우파이(Lo-Fi) 이미지를 사용합니다.

### 3. 핵심 용어 및 정책

- **메인 라우트**: 로그인 후 진입하는 메인 페이지는 `/home`으로 통일합니다.
- **Plan**: '스냅샷' 개념을 사용하지 않으며, 업로드된 문서를 직접 참조합니다.
- **기능 제외**:
  - 외부 서비스 연동(Integration)
  - 개인 노트(Personal Notes)
  - 세션 리마인더(Session Reminder)
  - 외부 알림(Notifications)

---

## 🔗 관련 링크

- **GitHub Repository**: (링크 추가 예정)
- **Figma Design**: (링크 추가 예정)
- **API Documentation**: (링크 추가 예정)
