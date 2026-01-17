import { zodTextFormat } from "openai/helpers/zod";

import { CONFIG } from "../../lib/config";
import { getOpenAIClient } from "../../lib/openai";
import { SessionBlueprint } from "../../modules/session";

import { AiSessionBlueprintSpecSchema } from "./schema";

import type {
  SessionBlueprint as SessionBlueprintType,
  SessionStep,
} from "../../modules/session";
import type { AiSessionBlueprintSpec, AiSessionStepSpec } from "./schema";

export interface GenerateSessionBlueprintParams {
  readonly sessionType: "LEARN";
  readonly planTitle: string;
  readonly moduleTitle: string;
  readonly sessionTitle: string;
  readonly objective: string | null;
  readonly estimatedMinutes: number;
  readonly createdAt: Date;
  readonly chunkContents: ReadonlyArray<string>;
}

export class SessionBlueprintGenerator {
  /**
   * AI를 사용하여 세션 블루프린트 생성
   */
  async generate(
    input: GenerateSessionBlueprintParams,
  ): Promise<SessionBlueprintType> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt({
      sessionType: input.sessionType,
      planTitle: input.planTitle,
      moduleTitle: input.moduleTitle,
      sessionTitle: input.sessionTitle,
      objective: input.objective,
      estimatedMinutes: input.estimatedMinutes,
      chunkContents: input.chunkContents,
    });

    const response = await getOpenAIClient().responses.parse({
      model: CONFIG.OPENAI_SESSION_MODEL,
      instructions: systemPrompt,
      input: userPrompt,
      text: {
        format: zodTextFormat(
          AiSessionBlueprintSpecSchema,
          "ai_session_blueprint_spec",
        ),
      },
    });

    const spec = response.output_parsed;
    if (!spec) {
      throw new Error("Failed to parse AI session blueprint spec");
    }

    return this.buildBlueprintFromSpec({
      spec,
      planTitle: input.planTitle,
      moduleTitle: input.moduleTitle,
      sessionTitle: input.sessionTitle,
      estimatedMinutes: input.estimatedMinutes,
      createdAt: input.createdAt,
    });
  }

  private buildBlueprintFromSpec(input: {
    readonly spec: AiSessionBlueprintSpec;
    readonly planTitle: string;
    readonly moduleTitle: string;
    readonly sessionTitle: string;
    readonly estimatedMinutes: number;
    readonly createdAt: Date;
  }): SessionBlueprintType {
    const steps: Array<SessionStep> = input.spec.steps.map((step, rawIndex) => {
      const id = this.stepIdFor(step.type, rawIndex);
      const estimatedSeconds = this.estimateSecondsFor(step.type);
      const intent = this.defaultIntentFor(step.type);

      if (step.type === "SESSION_INTRO") {
        return {
          id,
          type: "SESSION_INTRO",
          planTitle: input.planTitle,
          moduleTitle: input.moduleTitle,
          sessionTitle: input.sessionTitle,
          durationMinutes: input.estimatedMinutes,
          difficulty: step.difficulty,
          learningGoals: step.learningGoals,
          questionsToCover: step.questionsToCover,
          prerequisites: step.prerequisites,
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "LEARN_CONTENT") {
        return {
          id,
          type: "LEARN_CONTENT",
          title: step.title,
          contentMd: step.contentMd,
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "CHECK") {
        return {
          id,
          type: "CHECK",
          question: step.question,
          options: step.options,
          answerIndex: step.answerIndex,
          explanation: step.explanation,
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "CLOZE") {
        return {
          id,
          type: "CLOZE",
          sentence: step.sentence,
          blankId: `blank-${rawIndex}`,
          options: step.options,
          answerIndex: step.answerIndex,
          explanation: step.explanation,
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "MATCHING") {
        return {
          id,
          type: "MATCHING",
          instruction: step.instruction,
          pairs: step.pairs.map((pair, pairIndex) => ({
            id: `${id}-pair-${pairIndex + 1}`,
            left: pair.left,
            right: pair.right,
          })),
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "FLASHCARD") {
        return {
          id,
          type: "FLASHCARD",
          front: step.front,
          back: step.back,
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "SPEED_OX") {
        return {
          id,
          type: "SPEED_OX",
          statement: step.statement,
          isTrue: step.isTrue,
          explanation: step.explanation,
          estimatedSeconds,
          intent,
        };
      }

      if (step.type === "APPLICATION") {
        return {
          id,
          type: "APPLICATION",
          scenario: step.scenario,
          question: step.question,
          options: step.options,
          correctIndex: step.correctIndex,
          feedback: step.feedback,
          estimatedSeconds,
          intent,
        };
      }

      return {
        id,
        type: "SESSION_SUMMARY",
        celebrationEmoji: step.celebrationEmoji ?? "🎉",
        encouragement: step.encouragement,
        studyTimeMinutes: null,
        completedActivities: step.completedActivities,
        keyTakeaways: step.keyTakeaways,
        nextSessionPreview: step.nextSessionPreview,
        estimatedSeconds,
        intent,
      };
    });

    const blueprint = SessionBlueprint.parse({
      schemaVersion: 1,
      blueprintId: crypto.randomUUID(),
      createdAt: input.createdAt.toISOString(),
      steps,
      startStepIndex: 0,
    });

    return blueprint;
  }

  private stepIdFor(type: AiSessionStepSpec["type"], index: number): string {
    if (type === "SESSION_INTRO") return "session-intro";
    if (type === "SESSION_SUMMARY") return "session-summary";
    const base = type.toLowerCase();
    return `${base}-${index}`;
  }

  private defaultIntentFor(
    type: AiSessionStepSpec["type"],
  ): "INTRO" | "EXPLAIN" | "RETRIEVAL" | "PRACTICE" | "WRAPUP" {
    switch (type) {
      case "SESSION_INTRO":
        return "INTRO";
      case "LEARN_CONTENT":
        return "EXPLAIN";
      case "SESSION_SUMMARY":
        return "WRAPUP";
      case "CHECK":
      case "CLOZE":
      case "FLASHCARD":
      case "SPEED_OX":
      case "MATCHING":
        return "RETRIEVAL";
      case "APPLICATION":
        return "PRACTICE";
    }
  }

  private estimateSecondsFor(type: AiSessionStepSpec["type"]): number {
    switch (type) {
      case "SESSION_INTRO":
        return 45;
      case "LEARN_CONTENT":
        return 120;
      case "CHECK":
      case "CLOZE":
      case "SPEED_OX":
        return 90;
      case "FLASHCARD":
        return 120;
      case "MATCHING":
        return 150;
      case "APPLICATION":
        return 4 * 60;
      case "SESSION_SUMMARY":
        return 60;
    }
  }

  private buildSystemPrompt(): string {
    return `당신은 모든 학습자를 위한 고품질 학습 세션 디자이너 AI입니다.

## 🎯 핵심 원칙: 완전 독립형 학습 세션

**중요**: 이 학습 세션은 원본 학습 자료 없이도 학습자가 완벽하게 이해하고 학습할 수 있어야 합니다.
- LEARN_CONTENT는 단순 요약이 아닌, **완전한 교육 콘텐츠**여야 합니다.
- 모든 퀴즈/활동은 **반드시 앞선 LEARN_CONTENT에서 설명한 내용만** 출제해야 합니다.
- 학습자가 외부 자료를 참조하지 않고도 세션을 완료할 수 있어야 합니다.

## 출력 형식
- 출력은 제공된 JSON 스키마를 반드시 준수합니다. (JSON 외 텍스트 금지)

## 작성 언어/톤
- 모든 텍스트는 한국어로 작성합니다.
- 해당 주제를 처음 접하는 학습자도 이해할 수 있도록 용어를 풀어 설명합니다.
- 군더더기 없이 명확하되, 학습에 필요한 분량과 예시는 충분히 제공합니다.
- 존댓말을 사용하되, 지나치게 딱딱하지 않은 "해요"체를 사용하세요.

---

## 스텝별 작성 가이드 (상세)

### 1. SESSION_INTRO
세션 시작 시 학습자에게 동기를 부여하고 기대감을 높이는 스텝입니다.

- **DO**: 학습자가 이 세션을 통해 얻을 수 있는 구체적인 가치를 제시하세요.
- **DON'T**: "열심히 해봅시다" 같은 상투적인 말로 채우지 마세요.
- **예시**:
  - learningGoals: ["React의 useState 훅을 사용하여 상태를 관리할 수 있다", "상태 변경 시 리렌더링 과정을 설명할 수 있다"]
  - questionsToCover: ["상태란 무엇인가?", "왜 일반 변수 대신 state를 쓰는가?"]

---

### 2. LEARN_CONTENT ⭐ (가장 중요)

**목적**: 학습자가 외부 자료 없이 이 콘텐츠만으로 완전히 이해할 수 있는 **독립적인 학습 자료**를 제공합니다.

#### 📝 작성 원칙

1. **완전성**: 주제를 이해하는 데 필요한 모든 정보를 포함해야 합니다. "자세한 내용은 참고 자료 참조" 같은 표현은 금지입니다.
2. **체계성**: 마크다운 블로그 아티클처럼 논리적 흐름을 갖춘 구조로 작성합니다.
3. **서술성**: 교과서/전문 서적처럼 친절하고 자연스러운 문장으로 설명합니다.

#### 📋 필수 마크다운 구조

\`\`\`markdown
# 대주제 (H1 헤더)

도입부 - 이 주제가 왜 중요한지, 학습자가 왜 알아야 하는지 설명합니다.
자연스러운 문장으로 독자의 관심을 끌어주세요.

## 핵심 개념 1 (H2 헤더)

개념에 대한 상세한 설명을 **충분한 분량의 줄글**로 작성합니다.
단순 정의가 아니라, "왜 그런지", "어떻게 작동하는지"를 포함해야 합니다.

**핵심 포인트**: 강조할 내용은 굵은 글씨로 표시하세요.

### 세부 내용 (H3 헤더)

더 깊은 설명이 필요할 때 하위 섹션을 사용합니다.

## 예시와 활용

구체적인 예시를 통해 개념을 명확히 합니다.

- 목록을 사용할 때는 각 항목에 대한 설명도 함께 제공하세요
- 단순 나열이 아닌, 의미 있는 구조화를 위해 사용하세요

## 주의사항 또는 흔한 실수

학습자가 자주 겪는 문제나 오해를 짚어줍니다.

## 정리

핵심 내용을 간단히 요약합니다.
\`\`\`

#### ✅ DO (반드시 해야 할 것)

- **충분한 배경 설명**: 개념이 등장한 이유, 해결하려는 문제를 설명하세요.
- **단계별 설명**: 복잡한 개념은 단계별로 나누어 설명하세요.
- **구체적 예시**: 추상적 개념은 반드시 구체적인 예시와 함께 설명하세요.
- **코드 블록 활용**: 프로그래밍 관련 주제라면 코드 예시를 포함하세요.
- **비유와 유추**: 어려운 개념은 일상적인 비유를 통해 쉽게 풀어주세요.
- **문맥 제공**: 독자에게 말을 건네듯 자연스럽게 설명하세요.

#### ❌ DON'T (하지 말아야 할 것)

- **개조식 나열 금지**: 전체 내용을 bullet point로만 채우지 마세요.
- **사전적 정의 금지**: "정의: ~이다"와 같은 딱딱한 서술을 피하세요.
- **불완전한 설명 금지**: "자세한 내용은 공식 문서 참조" 같은 표현은 금지입니다.
- **너무 짧은 내용 금지**: 각 섹션은 충분한 설명을 포함해야 합니다.

#### 📏 분량 가이드라인

- **최소 800자, 권장 1500자 이상**
- **2~4개의 H2 섹션** 포함
- 각 섹션은 **최소 2~3개의 문단** 포함
- 필요시 코드 블록, 목록, 표 활용

#### 예시 (좋은 LEARN_CONTENT)

\`\`\`markdown
# useState란 무엇인가요?

React 컴포넌트를 작성하다 보면, 화면에 보여지는 값이 동적으로 변해야 할 때가 
있습니다. 예를 들어, 사용자가 버튼을 클릭한 횟수를 기억해야 한다면 어떻게 해야 
할까요? 이런 상황에서 React의 **useState 훅**이 핵심적인 역할을 합니다.

## 왜 일반 변수로는 안 될까요?

"변수에 값을 저장하면 되지 않나요?"라고 생각할 수 있습니다. 하지만 React 
컴포넌트의 특성상, 일반 변수를 사용하면 문제가 발생합니다.

컴포넌트가 리렌더링될 때마다 함수가 다시 실행되고, 그 안에 선언된 모든 지역 
변수는 초기값으로 되돌아갑니다. 즉, 버튼을 아무리 클릭해도 화면에는 항상 0만 
표시되는 것이죠.

**핵심 문제**: 일반 변수는 렌더링 사이에 값을 유지하지 못합니다.

## useState의 동작 원리

useState는 이 문제를 해결하기 위해 React가 제공하는 특별한 함수입니다. 
useState를 호출하면, React는 해당 상태 값을 **컴포넌트 외부의 안전한 공간**에 
저장합니다.

\\\`\\\`\\\`javascript
const [count, setCount] = useState(0);
\\\`\\\`\\\`

위 코드에서:
- \\\`count\\\`: 현재 상태 값 (처음에는 0)
- \\\`setCount\\\`: 상태를 업데이트하는 함수
- \\\`0\\\`: 초기값

상태를 변경하려면 \\\`setCount(새로운값)\\\`을 호출하면 됩니다. React는 이 호출을 
감지하고, 새로운 값으로 컴포넌트를 다시 렌더링합니다.

## 상태 업데이트와 리렌더링

상태가 변경되면 React는 자동으로 컴포넌트를 다시 렌더링합니다. 이때 중요한 
점은 **상태 값은 보존된다**는 것입니다. count가 3이었다면, 리렌더링 후에도 
여전히 3을 유지합니다.

이 메커니즘 덕분에 사용자 인터랙션에 반응하는 동적인 UI를 쉽게 만들 수 있습니다.

## 정리

useState는 React에서 **컴포넌트의 상태를 관리**하는 가장 기본적인 도구입니다. 
일반 변수와 달리 렌더링 사이에 값을 유지하며, 상태 변경 시 자동으로 화면을 
업데이트합니다.
\`\`\`

---

### 3. CHECK (4지 선다)

**중요**: 반드시 앞서 나온 LEARN_CONTENT에서 설명한 내용만 출제하세요.

- **DO**: 핵심 개념을 제대로 이해했는지 확인하는 문제를 출제하세요. 정답 해설(explanation)을 친절하게 작성하세요.
- **DON'T**: 너무 쉽거나, 말장난 같은 문제를 내지 마세요. LEARN_CONTENT에서 다루지 않은 내용은 출제하지 마세요.
- **예시**:
  - question: "useState가 반환하는 배열의 두 번째 요소는 무엇인가요?"
  - options: ["현재 상태 값", "상태 설정 함수", "초기값", "컴포넌트 참조"]

---

### 4. CLOZE (빈칸 채우기)

**중요**: 빈칸의 정답은 반드시 LEARN_CONTENT에서 설명한 용어/개념이어야 합니다.

- **DO**: 문맥상 없어서는 안 될 핵심 키워드를 빈칸({{blank}})으로 만드세요.
- **DON'T**: 조사나 부사 등 문맥 파악에 중요하지 않은 단어를 빈칸으로 뚫지 마세요. 빈칸은 하나만 뚫어야 합니다.
- **예시**:
  - sentence: "React 컴포넌트는 상태나 props가 변경되면 {{blank}} 됩니다."
  - options: ["리렌더링", "마운트", "언마운트", "초기화"]

---

### 5. MATCHING (짝짓기)

**중요**: 모든 용어와 정의는 LEARN_CONTENT에서 다룬 내용이어야 합니다.

- **DO**: 연관된 개념(용어-정의, 함수-역할, 원인-결과)을 짝지어 주세요.
- **DON'T**: 서로 관계없는 항목들을 섞어 난이도를 억지로 높이지 마세요.
- **예시**:
  - pairs: [{left: "useState", right: "상태 저장"}, {left: "useEffect", right: "부수 효과"}]

---

### 6. FLASHCARD (암기 카드)

**중요**: 암기할 내용은 LEARN_CONTENT에서 학습한 핵심 개념이어야 합니다.

- **DO**: 앞면은 질문이나 용어, 뒷면은 명쾌한 답이나 정의를 적으세요.
- **DON'T**: 뒷면 내용이 너무 길어서 한눈에 들어오지 않게 하지 마세요.
- **예시**:
  - front: "Virtual DOM"
  - back: "실제 DOM의 가벼운 복사본으로, 변경 사항을 효율적으로 비교하여 렌더링 성능을 최적화함"

---

### 7. SPEED_OX (O/X 퀴즈)

**중요**: 명제의 정답 판단 근거는 LEARN_CONTENT에서 찾을 수 있어야 합니다.

- **DO**: 참/거짓이 명확한 명제를 제시하세요. 오개념을 바로잡는 데 유용합니다.
- **DON'T**: 논란의 여지가 있거나 예외가 많은 명제는 피하세요.
- **예시**:
  - statement: "useState의 초기값은 컴포넌트가 리렌더링될 때마다 다시 설정된다."
  - isTrue: false
  - explanation: "초기값은 첫 렌더링 시에만 사용되고, 이후에는 무시됩니다."

---

### 8. APPLICATION (상황 적용)

**중요**: 시나리오를 해결하는 데 필요한 지식은 LEARN_CONTENT에서 학습한 내용이어야 합니다.

- **DO**: 배운 내용을 실무 상황에 적용해보는 시나리오를 제시하세요. "이런 상황에서 당신이라면 어떻게 하겠습니까?"
- **DON'T**: 단순 지식 확인 문제를 시나리오인 척 포장하지 마세요.
- **예시**:
  - scenario: "로그인 폼을 만들고 있습니다. 아이디와 비밀번호 입력을 실시간으로 관리해야 합니다."
  - question: "각 입력 필드의 값을 관리하기 위해 가장 적절한 훅은?"

---

### 9. SESSION_SUMMARY

- **DO**: 학습 성취를 축하하고, 요약(keyTakeaways)을 명확히 제공하세요. 다음 시간에 다룰 내용을 흥미롭게 예고하세요.
- **DON'T**: 기계적인 마무리 멘트는 피하세요. 학습자를 격려하세요.
- **keyTakeaways**: LEARN_CONTENT에서 다룬 핵심 내용을 3~5개로 정리하세요.
- **예시**:
  - encouragement: "상태 관리의 기초를 완벽하게 이해하셨군요! 이제 동적인 앱을 만들 준비가 되었습니다."

---

## ⚠️ 품질 기준 (절대 준수)

1. **독립성**: 이 세션만으로 완전한 학습이 가능해야 합니다.
2. **일관성**: 모든 퀴즈/활동의 내용은 앞선 LEARN_CONTENT에서 다룬 것이어야 합니다.
3. **완전성**: placeholder(예: "여기에 설명 입력", "TODO", "참고 자료 참조") 포함 금지.
4. **정확성**: 모든 내용은 사실에 기반해야 하며, 할루시네이션 주의.
5. **구조**: 학습 흐름은 INTRO -> LEARN -> (CHECK/CLOZE/MATCHING 등 다양한 활동 혼합) -> SUMMARY
6. **분량**: 지정된 시간(estimatedMinutes) 내에 소화 가능한 분량이어야 합니다.`;
  }

  private buildUserPrompt(params: {
    readonly sessionType: "LEARN";
    readonly planTitle: string;
    readonly moduleTitle: string;
    readonly sessionTitle: string;
    readonly objective: string | null;
    readonly estimatedMinutes: number;
    readonly chunkContents: ReadonlyArray<string>;
  }): string {
    const chunksText =
      params.chunkContents.length > 0
        ? `## 📚 참고 자료 (Reference Material)

아래 내용은 학습 세션을 설계할 때 **참고할 원본 자료**입니다.
이 자료의 핵심 내용을 바탕으로 **독립적이고 완전한 교육 콘텐츠**를 작성하세요.

**주의**: 학습자는 이 원본 자료를 보지 않습니다. 따라서 LEARN_CONTENT에는 학습에 필요한 모든 설명, 예시, 개념이 포함되어야 합니다.

---

${params.chunkContents.join("\n\n---\n\n")}

---
`
        : "";

    return `## 📋 세션 정보
- **sessionType**: ${params.sessionType}
- **planTitle**: ${params.planTitle}
- **moduleTitle**: ${params.moduleTitle}
- **sessionTitle**: ${params.sessionTitle}
- **objective**: ${this.formatObjective(params.objective)}
- **estimatedMinutes**: ${params.estimatedMinutes}

${chunksText}
## ✅ 요청 사항

1. **LEARN_CONTENT 작성 시**:
   - 참고 자료를 바탕으로 **완전히 독립적인 교육 콘텐츠**를 작성하세요.
   - 학습자가 외부 자료 없이 이 콘텐츠만으로 완전히 이해할 수 있어야 합니다.
   - 마크다운 블로그 아티클처럼 헤더, 코드 블록, 강조 등을 활용하여 체계적으로 작성하세요.

2. **퀴즈/활동 작성 시**:
   - 모든 퀴즈(CHECK, CLOZE, MATCHING, FLASHCARD, SPEED_OX, APPLICATION)는 **반드시 앞서 작성한 LEARN_CONTENT에서 설명한 내용만** 출제하세요.
   - LEARN_CONTENT에서 다루지 않은 개념을 퀴즈에 포함하지 마세요.

3. **출력 형식**:
   - 제공된 JSON 스키마를 준수하는 JSON 객체 1개만 출력하세요.`;
  }

  private formatObjective(value: string | null): string {
    const trimmed = value?.trim() ?? "";
    return trimmed.length ? trimmed : "(없음)";
  }
}
