# UI 패키지 리팩토링 계획

## 진행 상황 (Progress Update)

### 완료된 작업 (2025-11-18)

**Phase 1: 준비 단계** ✅ 완료

- 새로운 디렉토리 구조 생성
- 공통 유틸리티 설정 (`cn`, `focusRing`, `useComposeRefs`)
- 공통 타입 정의 (`BaseComponentProps`, `Size`, `ButtonVariant` 등)
- 상수 정의 (`ARIA_LABELS`)
- 스타일 variants (`buttonVariants`, `inputVariants`, `textAreaVariants`)
- 훅 기반 디렉토리 생성

**Phase 2: 컴포넌트 마이그레이션** ✅ 완료 (32개 컴포넌트 중 31개 완료)

- **High Priority**: button, button-group, form (Label, FieldError, FormDescription, FieldGroup, Form), text-field, dialog, separator
- **Medium Priority**: checkbox, radio-group, select, number-field, search-field, date-field, date-picker, badge, card
- **Low Priority**: slider, switch, input-group, menu, tabs, link, popover, tooltip, progress-bar, loading-spinner, sidebar, scroll-area, icon, disclosure, list-box
- **AI Components**: 전체 ai 디렉토리 구조 유지하며 components/ai/로 이동

**결과:**

- 총 133개 파일 생성
- 모든 컴포넌트에 `.types.ts`, `.tsx`, `index.ts` 구조 적용
- JSDoc 주석 및 사용 예시 작성
- 타입 안전성 강화 (any 타입 제거)
- 컴포넌트 간 의존성 정리

**다음 단계:**

- **Phase 3** (다음): package.json exports 업데이트 및 하위 호환성 유지
  - 모든 31개 컴포넌트의 새로운 export 경로 추가
  - 기존 export 경로 유지 (하위 호환성)
  - 중앙 components/index.ts 작성
  - 빌드 및 타입 검증
  - 참고: Phase 2에서 생성된 모든 컴포넌트 구조가 완비되었으므로 export만 수정하면 됨
- **Phase 4**: README 및 마이그레이션 가이드 작성
- **Phase 5**: 추가 최적화
- **Phase 6**: 레거시 파일 정리

### Phase 3 준비 정보

**마이그레이션된 컴포넌트 구조:**

```
packages/ui/src/components/
├── button/              # Button, ButtonGroup
├── form/                # Label, FieldError, FormDescription, FieldGroup, Form, TextField, NumberField, SearchField, DateField, Checkbox, RadioGroup, Select, Slider, Switch, InputGroup
├── navigation/          # Link, Menu, Tabs
├── overlay/             # Dialog, Popover, Tooltip
├── date/                # DateField, TimeField, DatePicker, DateRangePicker
├── layout/              # Card, Separator, Sidebar, ScrollArea
├── feedback/            # Progress, LoadingSpinner
├── display/             # Badge, Icon
├── interaction/         # Disclosure, ListBox
└── ai/                  # 기존 구조 유지
```

**package.json에서 추가할 exports (예시):**

```json
{
  "./components": "./src/components/index.ts",
  "./components/button": "./src/components/button/index.ts",
  "./components/form": "./src/components/form/index.ts",
  "./components/form/text-field": "./src/components/form/text-field/index.ts",
  "..."
}
```

**완료된 파일:**

- 모든 컴포넌트 .types.ts ✅
- 모든 컴포넌트 .tsx ✅
- 모든 스타일 variants ✅
- 모든 카테고리 index.ts ✅
- 공통 유틸리티, 타입, 상수 ✅

## 개요

`@repo/ui` 패키지를 더 깔끔하고 관리하기 쉬운 구조로 개선하기 위한 상세 계획입니다. 현재 32개의 컴포넌트가 src 루트에 평평하게 배치되어 있어 관리가 어렵고, 일관성 있는 구조가 필요합니다.

## 현재 구조 분석

### 디렉토리 구조

```
packages/ui/src/
├── ai/                  # ✅ 잘 구조화됨
│   ├── hooks/
│   ├── types.ts
│   ├── conversation.tsx
│   ├── message.tsx
│   ├── prompt-input.tsx
│   └── index.ts
├── styles/              # ✅ 스타일 파일
│   ├── components.css
│   └── theme.css
├── types/               # ⚠️ 확장 필요
│   └── solar-icons.ts
├── utils/               # ⚠️ 확장 필요
│   └── index.ts
└── [32개의 컴포넌트 파일들]  # ❌ 평평한 구조
```

### 현재 컴포넌트 목록 (32개)

**폼 관련 (9개)**

- text-field.tsx
- number-field.tsx
- search-field.tsx
- date-field.tsx
- checkbox.tsx
- radio-group.tsx
- select.tsx
- slider.tsx
- switch.tsx

**입력 컨테이너 (2개)**

- form.tsx
- input-group.tsx

**네비게이션 (3개)**

- link.tsx
- menu.tsx
- tabs.tsx

**오버레이 (4개)**

- dialog.tsx
- popover.tsx
- tooltip.tsx
- toast.tsx

**날짜 관련 (2개)**

- calendar.tsx
- date-picker.tsx

**레이아웃 (4개)**

- card.tsx
- sidebar.tsx
- scroll-area.tsx
- separator.tsx

**버튼 (2개)**

- button.tsx
- button-group.tsx

**피드백 (2개)**

- loading-spinner.tsx
- progress-bar.tsx

**디스플레이 (2개)**

- badge.tsx
- icon.tsx

**인터랙션 (2개)**

- disclosure.tsx
- list-box.tsx

### 주요 문제점

1. **평평한 구조**: 32개의 컴포넌트가 루트에 배치되어 탐색 및 관리 어려움
2. **카테고리 부재**: 관련 컴포넌트를 그룹화할 명확한 체계 없음
3. **공통 로직 분산**: 스타일, 타입, 유틸리티가 일부만 분리됨
4. **문서화 부족**: 컴포넌트 사용법 및 API 문서 부재
5. **타입 일관성**: 일부 컴포넌트만 타입 export
6. **패턴 불일치**: 컴포넌트마다 다른 export 패턴 사용

## 리팩토링 목표

### 주요 목표

1. **명확한 카테고리화**: 컴포넌트를 기능별로 그룹화
2. **일관된 구조**: 모든 컴포넌트가 동일한 패턴 따르기
3. **재사용성 향상**: 공통 로직과 스타일을 체계적으로 분리
4. **타입 안전성**: 모든 컴포넌트의 타입 정의 명확화
5. **문서화**: JSDoc 및 컴포넌트 API 문서 추가
6. **하위 호환성 유지**: 기존 코드 영향 최소화

### 성공 지표

- [x] 컴포넌트 카테고리별 그룹화 완료 (Phase 2 완료)
- [x] 100% 타입 커버리지 (모든 컴포넌트에 .types.ts 적용)
- [x] 모든 컴포넌트 JSDoc 작성 (완료)
- [ ] Storybook 스토리 완성도 80% 이상 (Phase 4에서)
- [ ] 기존 코드 빌드 에러 0건 (Phase 3 후 검증)

## 제안하는 새로운 구조

### 디렉토리 구조

```
packages/ui/src/
├── components/
│   ├── form/                    # 폼 관련 컴포넌트
│   │   ├── text-field/
│   │   │   ├── text-field.tsx
│   │   │   ├── text-field.types.ts
│   │   │   └── index.ts
│   │   ├── number-field/
│   │   ├── search-field/
│   │   ├── date-field/
│   │   ├── checkbox/
│   │   ├── radio-group/
│   │   ├── select/
│   │   ├── slider/
│   │   ├── switch/
│   │   ├── form/
│   │   ├── input-group/
│   │   └── index.ts           # 폼 컴포넌트 re-export
│   │
│   ├── navigation/              # 네비게이션 컴포넌트
│   │   ├── link/
│   │   ├── menu/
│   │   ├── tabs/
│   │   └── index.ts
│   │
│   ├── overlay/                 # 오버레이 컴포넌트
│   │   ├── dialog/
│   │   ├── popover/
│   │   ├── tooltip/
│   │   ├── toast/
│   │   └── index.ts
│   │
│   ├── date/                    # 날짜 관련 컴포넌트
│   │   ├── calendar/
│   │   ├── date-picker/
│   │   └── index.ts
│   │
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── card/
│   │   ├── sidebar/
│   │   ├── scroll-area/
│   │   ├── separator/
│   │   └── index.ts
│   │
│   ├── button/                  # 버튼 컴포넌트
│   │   ├── button/
│   │   ├── button-group/
│   │   └── index.ts
│   │
│   ├── feedback/                # 피드백 컴포넌트
│   │   ├── loading-spinner/
│   │   ├── progress-bar/
│   │   └── index.ts
│   │
│   ├── display/                 # 디스플레이 컴포넌트
│   │   ├── badge/
│   │   ├── icon/
│   │   └── index.ts
│   │
│   ├── interaction/             # 인터랙션 컴포넌트
│   │   ├── disclosure/
│   │   ├── list-box/
│   │   └── index.ts
│   │
│   ├── ai/                      # AI 관련 컴포넌트 (기존 유지)
│   │   ├── hooks/
│   │   ├── conversation/
│   │   │   ├── conversation.tsx
│   │   │   ├── conversation.types.ts
│   │   │   └── index.ts
│   │   ├── message/
│   │   ├── prompt-input/
│   │   ├── tool-execution-card/
│   │   ├── tool-invocation/
│   │   ├── tool-results/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   │
│   └── index.ts                 # 모든 컴포넌트 re-export
│
├── hooks/                       # 공통 훅
│   ├── use-controllable-state.ts
│   ├── use-media-query.ts
│   ├── use-local-storage.ts
│   └── index.ts
│
├── utils/                       # 유틸리티 함수
│   ├── cn.ts                    # className 유틸리티
│   ├── focus-ring.ts            # 포커스 링 스타일
│   ├── compose-refs.ts          # ref 컴포지션
│   └── index.ts
│
├── styles/                      # 스타일 관련
│   ├── components.css
│   ├── theme.css
│   ├── tokens/                  # 디자인 토큰
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   └── variants/                # 공통 variants
│       ├── button-variants.ts
│       ├── input-variants.ts
│       └── index.ts
│
├── types/                       # 공통 타입 정의
│   ├── solar-icons.ts
│   ├── component-props.ts       # 공통 props 타입
│   ├── variants.ts              # variant 타입
│   └── index.ts
│
├── constants/                   # 상수
│   ├── default-values.ts
│   ├── aria-labels.ts
│   └── index.ts
│
└── index.ts                     # 패키지 메인 엔트리
```

### 컴포넌트 내부 구조 (예: TextField)

```
components/form/text-field/
├── text-field.tsx              # 컴포넌트 구현
├── text-field.types.ts         # 타입 정의
├── text-field.styles.ts        # 스타일 정의 (선택적)
└── index.ts                    # exports
```

**index.ts 예시:**

```typescript
export { TextField } from "./text-field";
export type { TextFieldProps } from "./text-field.types";
```

## 마이그레이션 전략

### Phase 1: 준비 단계 (1-2일)

#### 1.1 새로운 디렉토리 구조 생성

```bash
# components 디렉토리 생성
mkdir -p packages/ui/src/components/{form,navigation,overlay,date,layout,button,feedback,display,interaction}

# 공통 디렉토리 생성
mkdir -p packages/ui/src/{hooks,constants}
mkdir -p packages/ui/src/styles/{tokens,variants}
```

#### 1.2 공통 유틸리티 정리

- `utils/index.ts`를 확장하여 모든 공통 유틸리티 포함
- `focus-ring`, `cn` 등 재사용 가능한 유틸리티 분리
- 공통 타입 정의 정리

### Phase 2: 컴포넌트 마이그레이션 (3-5일)

**마이그레이션 우선순위:**

1. **High Priority (핵심 컴포넌트)**
   - button, text-field, form, dialog
   - 가장 많이 사용되는 컴포넌트 우선

2. **Medium Priority (자주 사용)**
   - select, checkbox, radio-group, switch
   - card, badge, loading-spinner

3. **Low Priority (덜 사용)**
   - 나머지 컴포넌트들

**각 컴포넌트 마이그레이션 체크리스트:**

```markdown
- [ ] 새 디렉토리에 컴포넌트 복사
- [ ] 타입 정의 분리 (.types.ts)
- [ ] 스타일 로직 검토 및 최적화
- [ ] JSDoc 주석 추가
- [ ] index.ts 작성
- [ ] 카테고리 index.ts에 re-export 추가
- [ ] 기존 파일 유지 (하위 호환성)
```

**컴포넌트 템플릿:**

````typescript
// text-field.tsx
"use client";

import { TextField as AriaTextField } from "react-aria-components";
import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";

/**
 * 텍스트 입력을 위한 필드 컴포넌트
 *
 * @example
 * ```tsx
 * <TextField
 *   label="이름"
 *   placeholder="이름을 입력하세요"
 *   isRequired
 * />
 * ```
 */
export function TextField(props: TextFieldProps) {
  // 구현
}

// text-field.types.ts
import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";

export interface TextFieldProps extends AriaTextFieldProps {
  // 추가 props
}
````

### Phase 3: package.json 업데이트 (1일)

기존 exports를 유지하면서 새로운 exports 추가:

```json
{
  "exports": {
    // 기존 방식 (하위 호환성)
    "./badge": "./src/badge.tsx",
    "./button": "./src/button.tsx",

    // 새로운 방식 (권장)
    "./components/badge": "./src/components/display/badge/index.ts",
    "./components/button": "./src/components/button/button/index.ts",

    // 카테고리별 export
    "./components/form": "./src/components/form/index.ts",
    "./components/overlay": "./src/components/overlay/index.ts",

    // 공통 유틸리티
    "./hooks": "./src/hooks/index.ts",
    "./utils": "./src/utils/index.ts",
    "./types": "./src/types/index.ts",

    // 스타일
    "./styles": "./src/styles/index.ts",
    "./components.css": "./dist/styles/components.css",
    "./theme.css": "./src/styles/theme.css"
  }
}
```

### Phase 4: 문서화 및 정리 (2-3일)

#### 4.1 JSDoc 작성

모든 공개 컴포넌트 및 함수에 JSDoc 추가:

````typescript
/**
 * 버튼 컴포넌트
 *
 * @description
 * 사용자 액션을 트리거하는 클릭 가능한 버튼입니다.
 * React Aria Components의 Button을 기반으로 합니다.
 *
 * @example
 * 기본 사용법
 * ```tsx
 * <Button onPress={() => console.log('clicked')}>
 *   클릭하세요
 * </Button>
 * ```
 *
 * @example
 * Variant 사용
 * ```tsx
 * <Button variant="destructive" size="lg">
 *   삭제
 * </Button>
 * ```
 */
````

#### 4.2 README 작성

`packages/ui/README.md` 작성:

- 패키지 개요
- 설치 방법
- 기본 사용법
- 컴포넌트 카테고리별 소개
- 스타일링 가이드
- 기여 가이드

#### 4.3 마이그레이션 가이드 작성

`packages/ui/MIGRATION.md` 작성:

- 변경사항 요약
- import 경로 변경 방법
- Breaking changes (있다면)
- 코드 예시

### Phase 5: 최적화 및 개선 (2-3일)

#### 5.1 공통 스타일 추출

- 반복되는 스타일 패턴 식별
- `styles/variants/` 로 추출
- 컴포넌트에서 재사용

#### 5.2 공통 훅 추출

AI 컴포넌트에서 사용되는 훅 중 범용적인 것들 추출:

```typescript
// hooks/use-controllable-state.ts
// 제어/비제어 컴포넌트 상태 관리

// hooks/use-media-query.ts
// 반응형 디자인을 위한 미디어 쿼리

// hooks/use-local-storage.ts
// localStorage 상태 관리
```

#### 5.3 타입 시스템 강화

```typescript
// types/component-props.ts
/**
 * 모든 컴포넌트가 공통으로 받는 props
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
  "data-testid"?: string;
}

/**
 * variant를 지원하는 컴포넌트 props
 */
export interface VariantComponentProps<T> {
  variant?: T;
}

// types/variants.ts
export type Size = "sm" | "md" | "lg";
export type Variant =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";
```

#### 5.4 성능 최적화

- 불필요한 리렌더링 방지
- 번들 사이즈 최적화
- Tree-shaking 확인
- Lazy loading 고려

#### 5.5 Storybook 스토리 작성

각 컴포넌트의 모든 variant, state 스토리 작성:

```typescript
// components/button/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
```

#### 5.6 빌드 및 타입 체크

```bash
# 모든 워크스페이스 타입 체크
pnpm check-types

# UI 패키지 빌드
pnpm --filter @repo/ui build

# web 앱에서 UI 패키지 사용 확인
pnpm --filter web dev
```

### Phase 6: 기존 코드 제거 및 정리 (1일)

⚠️ **주의**: 충분한 검증 후에만 진행

#### 6.1 Deprecation 표시

기존 파일에 deprecation 주석 추가:

```typescript
// src/button.tsx
/**
 * @deprecated Use `import { Button } from '@repo/ui/components/button'` instead
 * This export will be removed in the next major version.
 */
export * from "./components/button/button";
```

#### 6.2 점진적 제거

1. 1-2주간 deprecation 경고 유지
2. web 앱의 모든 import 경로 업데이트
3. storybook 앱의 모든 import 경로 업데이트
4. 기존 파일 제거

## 상세 구현 가이드

### 1. 공통 유틸리티 구조

```typescript
// utils/cn.ts
/**
 * 클래스명을 병합하는 유틸리티 함수
 * tailwind-merge를 사용하여 중복 클래스 제거
 */
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// utils/focus-ring.ts
/**
 * 포커스 링 스타일을 위한 tailwind-variants
 */
import { tv } from "tailwind-variants";

export const focusRing = tv({
  base: "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2",
});

export const focusVisibleRing = tv({
  base: "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
});

// utils/compose-refs.ts
/**
 * 여러 ref를 하나로 합치는 유틸리티
 */
import { type Ref, useCallback } from "react";

export function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  }, refs);
}
```

### 2. 공통 타입 정의

```typescript
// types/component-props.ts
import type { AriaLabelingProps, DOMProps } from "react-aria";

/**
 * 기본 컴포넌트 props
 */
export interface BaseComponentProps extends DOMProps, AriaLabelingProps {
  /** 추가 CSS 클래스 */
  className?: string;
  /** 자동화나 디버깅을 위한 ID */
  "data-testid"?: string;
}

/**
 * 사이즈 prop을 지원하는 컴포넌트
 */
export interface SizeProps {
  /** 컴포넌트 크기 */
  size?: "sm" | "md" | "lg";
}

/**
 * Variant prop을 지원하는 컴포넌트
 */
export interface VariantProps<T extends string = string> {
  /** 컴포넌트 변형 */
  variant?: T;
}

// types/variants.ts
/**
 * 공통 variant 타입
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export type InputVariant = "default" | "ghost";

export type Size = "sm" | "md" | "lg";
```

### 3. 공통 스타일 Variants

```typescript
// styles/variants/button-variants.ts
import { tv } from "tailwind-variants";
import { focusVisibleRing } from "../../utils/focus-ring";

/**
 * 버튼 스타일 variants
 * Button, Link 등 여러 컴포넌트에서 재사용
 */
export const buttonVariants = tv({
  extend: focusVisibleRing,
  base: [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-primary text-primary-foreground data-[hovered]:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90",
      outline:
        "border border-input bg-background data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      secondary:
        "bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/80",
      ghost: "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      link: "text-primary underline-offset-4 data-[hovered]:underline",
    },
    size: {
      sm: "h-9 rounded-md px-3",
      md: "h-10 px-4 py-2",
      lg: "h-11 rounded-md px-8",
      icon: "size-10",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// styles/variants/input-variants.ts
import { tv } from "tailwind-variants";

/**
 * 입력 필드 컨테이너 스타일 variants
 * TextField, NumberField, SearchField 등에서 재사용
 */
export const inputGroupVariants = tv({
  base: "",
  variants: {
    variant: {
      default: [
        "relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
        "data-[disabled]:opacity-50",
      ],
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
```

### 4. 컴포넌트 구현 예시

````typescript
// components/button/button/button.tsx
"use client";

import { Button as AriaButton, composeRenderProps } from "react-aria-components";
import { buttonVariants } from "../../../styles/variants/button-variants";

import type { ButtonProps } from "./button.types";

/**
 * 버튼 컴포넌트
 *
 * @description
 * 사용자 액션을 트리거하는 클릭 가능한 버튼입니다.
 * React Aria Components의 Button을 기반으로 접근성을 보장합니다.
 *
 * @example
 * 기본 사용법
 * ```tsx
 * <Button onPress={() => console.log('clicked')}>
 *   클릭하세요
 * </Button>
 * ```
 *
 * @example
 * Variant와 Size 지정
 * ```tsx
 * <Button variant="destructive" size="lg" onPress={handleDelete}>
 *   삭제
 * </Button>
 * ```
 *
 * @example
 * 비활성화 상태
 * ```tsx
 * <Button isDisabled>
 *   비활성화됨
 * </Button>
 * ```
 */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonVariants({
          ...renderProps,
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}

// components/button/button/button.types.ts
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { buttonVariants } from "../../../styles/variants/button-variants";

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Button 컴포넌트 props
 */
export interface ButtonProps extends AriaButtonProps, ButtonVariantProps {
  /**
   * 버튼 변형
   * @default 'primary'
   */
  variant?: ButtonVariantProps['variant'];

  /**
   * 버튼 크기
   * @default 'md'
   */
  size?: ButtonVariantProps['size'];
}

// components/button/button/index.ts
export { Button } from './button';
export { buttonVariants } from '../../../styles/variants/button-variants';
export type { ButtonProps, ButtonVariantProps } from './button.types';
````

### 5. 카테고리별 Index 파일

```typescript
// components/button/index.ts
/**
 * 버튼 컴포넌트 모듈
 */
export * from "./button";
export * from "./button-group";

// components/form/index.ts
/**
 * 폼 관련 컴포넌트 모듈
 */
export * from "./text-field";
export * from "./number-field";
export * from "./search-field";
export * from "./date-field";
export * from "./checkbox";
export * from "./radio-group";
export * from "./select";
export * from "./slider";
export * from "./switch";
export * from "./form";
export * from "./input-group";

// components/index.ts
/**
 * @repo/ui 컴포넌트 라이브러리
 *
 * @description
 * React Aria Components 기반의 접근성 있는 UI 컴포넌트 라이브러리
 */

// Re-export all component categories
export * from "./button";
export * from "./form";
export * from "./navigation";
export * from "./overlay";
export * from "./date";
export * from "./layout";
export * from "./feedback";
export * from "./display";
export * from "./interaction";
export * from "./ai";
```

## 타입 안전성 강화

### 1. 엄격한 타입 정의

```typescript
// 나쁜 예 ❌
export function TextField(props: any) {
  // ...
}

// 좋은 예 ✅
export function TextField(props: TextFieldProps): JSX.Element {
  // ...
}

// 더 좋은 예 ✅✅
export function TextField({
  label,
  errorMessage,
  ...props
}: TextFieldProps): JSX.Element {
  // ...
}
```

### 2. Discriminated Unions 활용

```typescript
// types/component-props.ts

/**
 * 제어/비제어 컴포넌트를 위한 타입
 */
export type ControlledProps<T> = {
  /** 제어 모드 */
  isControlled: true;
  /** 현재 값 */
  value: T;
  /** 값 변경 핸들러 */
  onChange: (value: T) => void;
};

export type UncontrolledProps<T> = {
  /** 비제어 모드 */
  isControlled?: false;
  /** 기본값 */
  defaultValue?: T;
  /** 값 변경 핸들러 (선택적) */
  onChange?: (value: T) => void;
};

export type ControllableProps<T> = ControlledProps<T> | UncontrolledProps<T>;
```

### 3. Generic 타입 활용

```typescript
// components/form/select/select.types.ts

/**
 * Select 컴포넌트 props
 * @template T - 선택 가능한 아이템의 타입
 */
export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children"> {
  /** 선택 가능한 아이템 목록 */
  items?: Iterable<T>;
  /** 아이템을 렌더링하는 함수 */
  children: (item: T) => React.ReactNode;
}
```

## 성능 최적화 전략

### 1. Code Splitting

```typescript
// components/index.ts

// 자주 사용되는 컴포넌트는 직접 export
export { Button } from "./button";
export { TextField } from "./form/text-field";

// 덜 사용되는 컴포넌트는 lazy loading
export const Calendar = lazy(() =>
  import("./date/calendar").then((m) => ({ default: m.Calendar })),
);
export const DatePicker = lazy(() =>
  import("./date/date-picker").then((m) => ({ default: m.DatePicker })),
);
```

### 2. 번들 사이즈 최적화

```json
// package.json
{
  "sideEffects": ["**/*.css"]
}
```

### 3. Memoization

```typescript
// components/form/select/select.tsx
import { memo } from "react";

export const Select = memo(function Select<T extends object>(
  props: SelectProps<T>,
) {
  // ...
}) as <T extends object>(props: SelectProps<T>) => JSX.Element;
```

## 접근성 체크리스트

모든 컴포넌트는 다음 접근성 기준을 충족해야 합니다:

- [ ] **키보드 네비게이션**: Tab, Enter, Space, Arrow keys 지원
- [ ] **스크린 리더**: 적절한 ARIA 레이블 및 역할
- [ ] **포커스 관리**: 명확한 포커스 표시 (focus ring)
- [ ] **색상 대비**: WCAG AA 기준 이상 (4.5:1)
- [ ] **에러 메시지**: 명확하고 접근 가능한 에러 표시
- [ ] **상태 표시**: disabled, invalid 등 상태 명확히 표시
- [ ] **레이블 연결**: 모든 form 요소에 레이블 연결

## 문서화 가이드

### 1. 컴포넌트 문서 구조

````typescript
/**
 * [컴포넌트 이름]
 *
 * @description
 * [컴포넌트에 대한 간단한 설명]
 * [주요 기능 설명]
 *
 * @example
 * 기본 사용법
 * ```tsx
 * [기본 예시 코드]
 * ```
 *
 * @example
 * [고급 기능 1]
 * ```tsx
 * [예시 코드]
 * ```
 *
 * @example
 * [고급 기능 2]
 * ```tsx
 * [예시 코드]
 * ```
 *
 * @see {@link [관련 컴포넌트 링크]}
 */
````

### 2. Props 문서화

```typescript
export interface ButtonProps {
  /**
   * 버튼에 표시될 내용
   */
  children: React.ReactNode;

  /**
   * 버튼 변형
   *
   * @default 'primary'
   *
   * - `primary`: 주요 액션 (예: 저장, 제출)
   * - `secondary`: 보조 액션
   * - `destructive`: 위험한 액션 (예: 삭제)
   * - `outline`: 덜 중요한 액션
   * - `ghost`: 최소한의 스타일
   * - `link`: 링크 스타일
   */
  variant?: ButtonVariant;

  /**
   * 버튼 크기
   *
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "icon";

  /**
   * 버튼 클릭 핸들러
   *
   * @param e - Press 이벤트
   */
  onPress?: (e: PressEvent) => void;
}
```

## 위험 관리

### 잠재적 위험과 대응 방안

| 위험                      | 영향도 | 발생 가능성 | 대응 방안                                                          |
| ------------------------- | ------ | ----------- | ------------------------------------------------------------------ |
| 기존 코드 호환성 깨짐     | 높음   | 중간        | - 기존 exports 유지<br>- 점진적 마이그레이션<br>- Deprecation 경고 |
| 마이그레이션 중 버그 발생 | 중간   | 중간        | - 수동 검증 및 코드 리뷰<br>- 단계별 진행<br>- 롤백 계획           |
| 일정 지연                 | 낮음   | 높음        | - 우선순위 설정<br>- Phase별 진행<br>- 최소 기능부터               |
| 타입 에러 증가            | 중간   | 낮음        | - 점진적 타입 추가<br>- 충분한 검증                                |
| 번들 사이즈 증가          | 낮음   | 낮음        | - Tree-shaking 확인<br>- 번들 분석                                 |

### 롤백 계획

각 Phase 완료 후:

1. 빌드 성공 확인
2. 타입 체크 통과 확인
3. Storybook 정상 작동 확인

문제 발생 시:

1. Git을 사용하여 이전 Phase로 되돌리기
2. 문제 원인 분석
3. 수정 후 재시도

## 타임라인

### 전체 일정: 약 2-3주

```
Week 1: 준비 및 기반 작업
├─ Day 1-2: Phase 1 (준비 단계)
├─ Day 3-5: Phase 2 시작 (High Priority 컴포넌트)
└─ Day 6-7: Phase 2 계속 (Medium Priority 컴포넌트)

Week 2: 마이그레이션 및 문서화
├─ Day 8-9: Phase 2 완료 (Low Priority 컴포넌트)
├─ Day 10: Phase 3 (package.json 업데이트)
└─ Day 11-13: Phase 4 (문서화 및 정리)

Week 3: 최적화 및 검증
├─ Day 14-17: Phase 5 (최적화 및 개선)
└─ Day 18-20: Phase 6 (정리 및 릴리스 준비)
```

### 마일스톤

- ✅ **M1 (Week 1 종료)**: 핵심 컴포넌트 마이그레이션 완료
- ✅ **M2 (Week 2 종료)**: 모든 컴포넌트 마이그레이션 및 문서화 완료
- ✅ **M3 (Week 3 종료)**: 최적화 완료, 릴리스 준비 완료

## 성공 측정 지표

### 정량적 지표

- **타입 커버리지**: 100% (모든 공개 API에 타입 정의)
- **번들 사이즈**: 현재 대비 10% 이내 증가
- **Storybook 커버리지**: 80% 이상의 컴포넌트에 스토리 존재
- **빌드 시간**: 현재 대비 20% 이내 증가
- **접근성 위반**: 0건 (axe-core 기준)

### 정성적 지표

- [ ] 개발자 경험 개선 (import 경로 명확화)
- [ ] 코드 가독성 향상
- [ ] 유지보수성 개선
- [ ] 문서화 완성도
- [ ] 팀원 만족도

## 향후 개선 계획

리팩토링 완료 후 고려할 추가 개선사항:

### 1. 테마 시스템 강화

```typescript
// themes/light.ts
// themes/dark.ts
// themes/custom.ts

// 런타임 테마 전환 지원
```

### 2. 컴포지션 패턴 확대

```tsx
// 더 유연한 컴포넌트 구성
<Dialog>
  <DialogTrigger>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogBody>{/* Content */}</DialogBody>
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. Headless UI 옵션

```typescript
// 스타일이 없는 headless 버전 제공
import { useButton } from "@repo/ui/hooks";

// 또는
import { Button } from "@repo/ui/headless";
```

### 4. 디자인 토큰 시스템

```typescript
// tokens/colors.ts
// tokens/spacing.ts
// tokens/typography.ts

// CSS 변수 + TypeScript 타입 안전성
```

### 5. 애니메이션 시스템

```typescript
// animations/fade.ts
// animations/slide.ts
// animations/scale.ts

// Motion + Tailwind CSS Animate 활용
```

## 참고 자료

### 내부 문서

- `CLAUDE.md`: 프로젝트 전체 가이드라인
- `AGENTS.md`: 코딩 원칙 및 패턴
- `docs/ubiquitous-language.md`: 도메인 용어
- `docs/trade-off.md`: 아키텍처 결정 사항

### 외부 리소스

- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
- [Tailwind Variants](https://www.tailwind-variants.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Storybook](https://storybook.js.org/)

### 컴포넌트 라이브러리 참고

- [shadcn/ui](https://ui.shadcn.com/) - 구조 및 패턴 참고
- [Radix UI](https://www.radix-ui.com/) - Headless 컴포넌트 참고
- [Chakra UI](https://chakra-ui.com/) - 테마 시스템 참고
- [Mantine](https://mantine.dev/) - 문서화 스타일 참고

## 체크리스트

### Phase 1: 준비 단계 ✅ DONE

- [x] 새로운 디렉토리 구조 생성
- [x] 공통 유틸리티 정리 (cn, focusRing, useComposeRefs)
- [x] 공통 타입 정의 (BaseComponentProps, Size, ButtonVariant 등)

### Phase 2: 컴포넌트 마이그레이션 ✅ DONE

- [x] High Priority 컴포넌트 (button, text-field, form, dialog, separator)
- [x] Medium Priority 컴포넌트 (checkbox, radio-group, select, number-field, search-field, date-field, date-picker, badge, card)
- [x] Low Priority 컴포넌트 (slider, switch, input-group, menu, tabs, link, popover, tooltip, progress-bar, loading-spinner, sidebar, scroll-area, icon, disclosure, list-box)
- [x] AI 컴포넌트 구조 유지 (components/ai/로 이동)

### Phase 3: package.json 업데이트 ⏳ NEXT

- [ ] 새로운 exports 추가 (모든 31개 컴포넌트)
- [ ] 기존 exports 유지 (하위 호환성)
- [ ] 빌드 스크립트 검증

### Phase 4: 문서화 및 정리

- [ ] JSDoc 작성 (모든 공개 API)
- [ ] README.md 작성
- [ ] MIGRATION.md 작성
- [ ] Storybook 스토리 작성

### Phase 5: 최적화 및 개선

- [ ] 공통 스타일 추출
- [ ] 공통 훅 추출
- [ ] 타입 시스템 강화
- [ ] 성능 최적화

### Phase 6: 기존 코드 제거 및 정리

- [ ] Deprecation 표시
- [ ] web 앱 import 경로 업데이트
- [ ] storybook 앱 import 경로 업데이트
- [ ] 기존 파일 제거 (충분한 검증 후)

## 결론

이 리팩토링 계획은 `@repo/ui` 패키지를 다음과 같이 개선합니다:

1. **명확한 구조**: 컴포넌트를 기능별로 그룹화하여 탐색 및 관리 용이
2. **일관성**: 모든 컴포넌트가 동일한 패턴과 구조를 따름
3. **타입 안전성**: 완벽한 TypeScript 타입 지원
4. **문서화**: 포괄적인 JSDoc 및 사용 예시
5. **성능**: 최적화된 번들 사이즈 및 로딩 시간
6. **접근성**: WCAG 기준을 충족하는 접근 가능한 컴포넌트
7. **개발자 경험**: 명확한 API와 우수한 DX

단계별로 진행하고 각 Phase마다 충분한 검증을 거쳐 안정적인 리팩토링을 수행합니다.
