# 학습 계획 튜터 페르소나 기능 도입 기획 검토 보고서

## 1. 개요
본 문서는 사용자 맞춤형 학습 경험을 강화하기 위한 **'튜터 페르소나(Tutor Persona)'** 기능 도입에 대한 기술적 타당성 검토 및 구현 상세 계획을 담고 있습니다. 사용자가 학습 계획 생성 시 선호하는 튜터 스타일을 선택하면, 이후 생성되는 세션의 어조와 스타일이 해당 페르소나에 맞춰 조정됩니다.

### 1.1 주요 요구사항
- **지원 페르소나**: 친절한 튜터(friendly), 스파르타형 튜터(spartan), 친구같은 튜터(buddy)
- **적용 범위**: 학습 계획 및 세션 생성 시의 텍스트 어조(Tone)와 스타일(Style)에만 영향을 미침 (구조적 변경 최소화)
- **데이터 저장**: 단순 문자열(String) 형태로 관리

---

## 2. 기술적 타당성 검토 (Technical Feasibility)

### 2.1 아키텍처 적합성
현재 시스템은 `Database (Schema) -> API (DTO/Service) -> AI (Prompt) -> Frontend (UI)`의 흐름이 명확하게 분리되어 있습니다. 본 기능은 이 파이프라인에 메타데이터 필드 하나를 추가하고, AI 프롬프트 생성 로직에서 이를 분기 처리하는 형태이므로, 기존 아키텍처를 해치지 않고 매우 자연스럽게 통합 가능합니다.

### 2.2 복잡도 분석
- **난이도**: 하 (Low)
- **영향도**: 국소적 (Plans 도메인 및 AI 모듈에 한정)
- **확장성**: 향후 페르소나 추가 시 Enum 또는 상수 변경만으로 대응 가능

---

## 3. 상세 구현 명세 (Implementation Specification)

### 3.1 데이터베이스 (Database)
`plans` 테이블과 `plan_generation_requests` 테이블에 페르소나 정보를 저장할 컬럼을 추가합니다.

- **대상 파일**: `packages/database/src/schema/plans.ts`
- **변경 사항**:
  ```typescript
  // planGenerationRequests 및 plans 테이블 공통
  tutorPersona: text("tutor_persona"), // nullable, 예: "friendly", "spartan", "buddy"
  ```
- **마이그레이션**: `drizzle-kit`을 이용한 스키마 마이그레이션 필요.

### 3.2 백엔드 API & DTO
프론트엔드로부터 페르소나 정보를 받아 처리하기 위한 DTO 업데이트가 필요합니다.

- **대상 파일**: `apps/api/src/modules/plan/plan.dto.ts`
- **변경 사항**:
  - `TutorPersonaSchema` 정의 (zod string/enum)
  - `CreatePlanInput`에 `tutorPersona` 필드 추가 (Optional)
  - `PlanDetailResponse`에 해당 필드 포함

### 3.3 AI 프롬프트 엔지니어링 (AI Core)
가장 핵심적인 부분으로, 선택된 페르소나에 따라 LLM에 주입되는 시스템 프롬프트(System Prompt)의 지시사항(Instruction)을 동적으로 변경합니다.

- **대상 파일**: `apps/api/src/ai/plan/prompts.ts`
- **전략**:
  - **친절한 튜터 (Friendly)**:
    - *"격려하고 지지하는 어조를 사용합니다. '할 수 있어요', '잘하고 있습니다' 같은 표현을 적극 사용합니다."*
  - **스파르타형 튜터 (Spartan)**:
    - *"직설적이고 엄격한 어조를 사용합니다. 불필요한 미사여구를 빼고 핵심만 전달하며, 강한 동기부여를 제공합니다."*
  - **친구같은 튜터 (Buddy)**:
    - *"친근하고 캐주얼한 반말/해요체를 섞어 사용합니다. 옆에서 같이 공부하는 친구처럼 대화하듯 작성합니다."*
- **적용 지점**: `buildModulePopulationSystemPrompt` 및 세션 생성 프롬프트에 `PERSONA_INSTRUCTION` 변수 주입.

### 3.4 프론트엔드 UI (Frontend)
사용자가 위저드(Wizard) 과정에서 자연스럽게 선택할 수 있도록 UI를 구성합니다.

- **위치**: 학습 계획 생성 위저드 - **Step 2 (목표 설정 단계)**
- **대상 파일**: `apps/web/src/domains/plans/ui/wizard/step-goal-setting.tsx`
- **구성**:
  - `RadioOptionCard` 컴포넌트를 활용하여 3가지 옵션(카드 형태)으로 제시
  - 아이콘이나 간단한 설명(예: "따뜻하게 격려해주는 선생님")을 곁들여 선택 돕기

---

## 4. 기대 효과 및 고려사항

### 4.1 기대 효과
- **학습 몰입도 증가**: 사용자가 선호하는 스타일로 피드백을 받음으로써 학습 지속 의지 고취
- **개인화 경험 강화**: 단순한 정보 전달을 넘어 정서적 교감을 통한 UX 향상

### 4.2 고려사항 (Risks & Notes)
- **기존 데이터 호환성**: 기존에 생성된 계획은 `tutorPersona` 값이 `null`일 것입니다. 이 경우 기본값(Default, 예: Friendly)으로 처리하는 로직이 필요합니다.
- **프롬프트 일관성**: AI 모델 특성상 페르소나 지시를 내려도 가끔 어조가 흔들릴 수 있습니다. 프롬프트 내에 "모든 응답은 반드시 지정된 페르소나 어조를 유지하라"는 강력한 제약 조건을 포함해야 합니다.

## 5. 결론
'튜터 페르소나' 기능은 적은 개발 비용으로 높은 사용자 만족도를 이끌어낼 수 있는 고효율 기능으로 판단됩니다. 기술적 리스크가 낮고 기존 아키텍처와 잘 부합하므로 **즉시 도입을 권장**합니다.
