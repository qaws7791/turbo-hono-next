# AI 및 RAG(Knowledge) 마이그레이션 계획

이 문서는 모듈러 모놀리스 아키텍처 원칙에 따라, 현재 `apps/api`에 집중된 거대 AI 및 RAG 로직을 분리하고 재구성하기 위한 계획입니다.

## 1. 개요 및 철학

### 1.1 핵심 목표

1.  **기술과 도메인의 분리**: AI SDK(기술)와 지식 관리(도메인), 활용 로직(비즈니스)을 명확히 분리합니다.
2.  **모듈 간 결합도 감소**: `apps/api`의 AI 로직이 여러 도메인(`Material`, `Plan`, `Session`)과 복잡하게 얽힌 현상을 해소합니다.
3.  **Knowledge 모듈 신설**: 현행 `Material` 중심의 RAG를 범용적인 "지식 저장소"로 일반화하여 확장성을 확보합니다.

### 1.2 구조 조감도

| 계층            | 패키지/모듈     | 역할                          | 주요 구성 요소                                        |
| :-------------- | :-------------- | :---------------------------- | :---------------------------------------------------- |
| **Technical**   | `@repo/ai`      | AI 기술 래퍼 (Infrastructure) | `GoogleGenAI` 클라이언트, 모델 초기화, 토큰 관리      |
| **Core Module** | `api/knowledge` | 지식 베이스 (Data/Domain)     | 벡터 저장소, 문서 수집(Ingest), 유사도 검색(Retrieve) |
| **Core Module** | `api/plan` 등   | AI 활용 (Business Logic)      | 프롬프트 엔지니어링, 학습 계획 생성 시나리오          |

---

## 2. 상세 구성 계획

### 2.1 기술 패키지 신설: `@repo/ai`

- **위치**: `packages/ai`
- **역할**: 순수 기술적 AI 연동을 담당합니다. 비즈니스 로직을 전혀 포함하지 않습니다.
- **주요 파일 이동**:
  - `apps/api/src/lib/ai.ts` → `packages/ai/src/index.ts` (또는 `client.ts`)
  - `AiModels`, `ChatModel`, `EmbeddingModel`, `createAiModels` 등 클래스 및 팩토리.
- **의존성**: `packages/core`를 의존하지 않음. 반대로 `core`의 인프라 계층이 이 패키지를 사용.

### 2.2 신규 코어 모듈: `Knowledge` (`search` → `knowledge`)

기존 `rag` 관련 코드를 이 모듈로 이동시키고, 특정 도메인(`Material`)에 종속된 코드를 **일반화(Generalization)**합니다.

- **위치**: `packages/core/src/modules/knowledge`
- **변경 사항 (Refactoring)**:
  - **네이밍 변경**:
    - `Material` → `Document` 또는 `KnowledgeItem`
    - `materialId` → `refId` (Reference ID)
    - `source: "material"` → `type: string` (확장성 확보)
  - **기능 확장**:
    - 자료 뿐만 아니라 추후 '계획', '대화 내역' 등도 인덱싱 가능하도록 `type` 필드로 구분.
- **Public API (Facade)**:

  ```typescript
  interface KnowledgeFacade {
    // 문서 수집 (Ingestion)
    ingest(params: {
      type: string; // 예: "material"
      refId: string; // 예: materialId
      title: string;
      content: string;
      metadata?: Record<string, any>;
    }): Promise<Result<IngestResult>>;

    // 범위 검색 (Retrieval)
    retrieve(params: {
      query: string;
      filter?: { type?: string; refId?: string };
      limit?: number;
    }): Promise<Result<SearchResult[]>>;
  }
  ```

### 2.3 도메인별 AI 활용 로직 분산 (Distributed AI)

프롬프트와 생성 로직은 해당 도메인의 **핵심 비즈니스 규칙**이므로, 각 모듈 내부로 이동합니다.

- **Plan 모듈 (`packages/core/src/modules/plan`)**
  - `apps/api/src/ai/plan/generator.ts` → `internal/infrastructure/adapters/plan-generator.adapter.ts`
  - `apps/api/src/ai/plan/prompts.ts` → `internal/application/ai/prompts.ts`
  - **의존성**: `@repo/ai` (모델 호출), `KnowledgeFacade` (벡터 데이터 조회).

- **Material 모듈 (`packages/core/src/modules/material`)**
  - `apps/api/src/ai/material/analyzer.ts` → `internal/infrastructure/adapters/material-analyzer.adapter.ts`
  - 자료 업로드 시 `KnowledgeFacade.ingest()`를 호출하여 인덱싱 위임.

---

## 3. 마이그레이션 시나리오

단계별로 진행하여 시스템 중단을 최소화합니다.

### Phase 1: 기술 패키지 분리 (`@repo/ai`)

1.  **패키지 생성**: `packages/ai` 폴더 생성 및 `package.json` 설정.
2.  **코드 이동**: `apps/api/src/lib/ai.ts`의 내용을 `packages/ai`로 이동.
3.  **의존성 연결**: `apps/api` 및 `packages/core`가 `packages/ai`를 의존하도록 설정.
4.  **검증**: 기존 API가 정상적으로 AI 모델을 초기화하는지 확인.

### Phase 2: Knowledge 모듈 구축 및 일반화

1.  **모듈 스캐폴딩**: `packages/core/src/modules/knowledge` 생성.
2.  **RAG 코드 이동**: `retriever.ts`, `ingestor.ts`, `vector-store.ts` 이동.
3.  **일반화 리팩토링**: `materialId` 등 구체적 용어를 `refId`, `type` 등 추상적 용어로 변경.
    - _주의_: 기존 DB 데이터(벡터 스토어의 메타데이터) 호환성 확인 필요 (필요 시 마이그레이션 스크립트 실행).
4.  **Facade 구현**: 외부에서 사용할 인터페이스 정의.

### Phase 3: 도메인 로직 이전

1.  **Material 이동**: `Material` 모듈 내에서 `DocumentParser`, `Analyzer` 등을 `core`로 이동하고 `KnowledgeFacade` 연결.
2.  **Plan 이동**: `LearningPlanGenerator`를 `Plan` 모듈 내부의 `UseCase`나 `Service`로 리팩토링 및 이동. `KnowledgeFacade`를 통해 데이터 조회하도록 수정.
3.  **Session 이동**: `SessionBlueprintGenerator` 이동.

### Phase 4: Clean Up

1.  `apps/api/src/ai` 디렉토리 삭제.
2.  `apps/api/src/lib/ai.ts` 삭제.
3.  누락된 의존성 점검 및 전체 테스트 수행.

## 4. 체크리스트

- [ ] `@repo/ai` 패키지 빌드 및 동작 확인.
- [ ] `Knowledge` 모듈이 `Material` 도메인에 의존하지 않는지 확인 (단방향: Material -> Knowledge).
- [ ] RAG 검색 시 기존 `materialId` 필터링이 `refId` + `type` 필터링으로 정상 작동하는지 확인.
- [ ] `Plan` 생성 시나리오가 정상적으로 수행되는지 확인 (E2E 테스트 권장).
