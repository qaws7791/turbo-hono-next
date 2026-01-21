# 📚 AI 개인화 학습 플랫폼 문서

> **목표만 말하세요. 나머지는 AI가 합니다.**

AI가 학습 전 과정을 자동으로 설계·운영하는 **개인 학습 운영체제(Learning OS)** 프로젝트 문서입니다.

---

## 📖 문서 구조

### [01. Overview (개요)](./01-overview/)

- [플랫폼 비전](./01-overview/vision.md) - 핵심 가치 제안 및 목표
- [제품 원칙](./01-overview/product-principles.md) - 단순성, 자동화, 개인화 원칙
- [용어집](./01-overview/glossary.md) - 프로젝트 용어 정의

### [02. Design (디자인)](./02-design/)

- [디자인 컨셉](./02-design/design-concept.md) - Calm Focus OS
- [컬러 시스템](./02-design/color-system.md) - 팔레트 및 디자인 토큰
- [타이포그래피](./02-design/typography.md) - 폰트 및 타입 스케일
- [레이아웃](./02-design/layout.md) - 그리드 및 여백 규칙
- [모션](./02-design/motion.md) - 애니메이션 원칙
- [아이콘](./02-design/icons.md) - 아이콘 및 그래픽 가이드
- [접근성](./02-design/accessibility.md) - 접근성 가이드라인

### [03. Product (제품 기획)](./03-product/)

- [사용자 플로우](./03-product/user-flow.md) - 핵심 사용자 여정
- [정보 구조](./03-product/information-architecture.md) - IA 및 네비게이션

#### [페이지별 기획](./03-product/pages/)

- [랜딩 페이지](./03-product/pages/landing.md)
- [로그인](./03-product/pages/login.md)
- [홈 (Home)](./03-product/pages/home.md)
- [오늘 할 일 (Today)](./03-product/pages/today.md)
- [Materials (자료 관리)](./03-product/pages/materials.md)
- [Plans](./03-product/pages/plans.md)
- [Plan 생성 위저드](./03-product/pages/plan-creation-wizard.md)
- [Plan 상세](./03-product/pages/plan-detail.md)
- [학습 세션](./03-product/pages/learning-session.md)
- [설정 (다이얼로그)](./03-product/pages/settings.md)

#### [기능별 기획](./03-product/features/)

- [Plan 시스템](./03-product/features/plan-system.md)

### [04. Engineering (엔지니어링)](./04-engineering/)

- [기술 스택](./04-engineering/tech-stack.md) - 사용 기술 개요
- [시스템 아키텍처](./04-engineering/architecture.md) - 전체 구조
- [데이터 모델](./04-engineering/data-models.md) - 엔티티 및 관계

#### [API](./04-engineering/api/)

#### [Frontend](./04-engineering/frontend/)

#### [Backend](./04-engineering/backend/)

#### [Policies (정책)](./04-engineering/policies/)

- [학습 자료 삭제 정책](./04-engineering/policies/material-deletion.md) - 좀비 데이터 전략

---

## 📄 핵심 개념

| 개념        | 설명                           |
| ----------- | ------------------------------ |
| **Plan**    | 업로드된 문서 기반의 학습 계획 |
| **Session** | 20~40분 단위의 몰입형 학습     |

---

## � 프로젝트 규칙 및 가이드라인

### 1. 문서 작성 가이드

- **01-Overview ~ 03-Product**:
  - **대상**: 기획자, 디자이너, 개발자 등 모든 이해관계자.
  - **원칙**:
    - 기술적인 전문 용어와 코드 스니펫 사용을 엄격히 금지합니다.
    - 누구나 쉽게 이해할 수 있는 명확하고 평이한 언어로 작성합니다.
    - '어떻게 구현하는가'보다 '무엇을 왜 제공하는가(UX)'에 집중합니다.
- **04-Engineering**:
  - **대상**: 개발팀.
  - **원칙**: 기술적 상세 구현, 아키텍처, 데이터 모델 등을 구체적으로 기술합니다.

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
