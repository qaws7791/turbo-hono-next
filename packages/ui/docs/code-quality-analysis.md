# UI Package 코드 품질 분석 보고서

**분석 기준**: CLAUDE.md 가이드라인
**분석 일자**: 2025-11-17
**전체 평가**: B+ (좋은 구현, 타입 네이밍 규칙 개선 필요)

---

## 📊 요약

UI 패키지는 React Aria Components를 기반으로 한 접근성 높은 컴포넌트 라이브러리입니다. 컴포넌트 품질과 타입 안전성은 우수하나, **타입 네이밍 규칙**이 CLAUDE.md 가이드라인과 일치하지 않습니다.

### 주요 지표

| 카테고리 | 현황 |
|----------|------|
| **React Aria Components** | ✅ 적절히 사용 |
| **타입 안전성** | ✅ any 타입 없음 |
| **컴포넌트 네이밍** | ✅ PascalCase 사용 |
| **파일 네이밍** | ✅ kebab-case 사용 |
| **타입 네이밍 규칙** | ⚠️ T prefix 누락 |
| **컴포넌트 품질** | ✅ 우수한 구조 |

---

## 🟡 중간 우선순위 이슈 (Medium)

### 1. 타입 네이밍 규칙 위반

**가이드라인 위반**: "Type parameters: PascalCase with `T` prefix (e.g., `TUser`)"
**심각도**: MEDIUM
**영향**: 코드 일관성, 가독성

#### 1.1 Button 컴포넌트

**파일**: `src/button.tsx`
**라인**: 47

**현재 구현 (위반)**:
```typescript
// ❌ T prefix 없음
type buttonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends AriaButtonProps,
    buttonVariantProps {
  children?: React.ReactNode;
}
```

**권장 수정**:
```typescript
// ✅ T prefix 추가, PascalCase 사용
type TButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends AriaButtonProps,
    TButtonVariantProps {
  children?: React.ReactNode;
}
```

---

#### 1.2 Badge 컴포넌트

**파일**: `src/badge.tsx`
**라인**: 44

**현재 구현 (위반)**:
```typescript
// ❌ T prefix 없음
type BadgeStylesProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps extends BadgeStylesProps {
  children: React.ReactNode;
  className?: string;
}
```

**권장 수정**:
```typescript
// ✅ T prefix 추가
type TBadgeStylesProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps extends TBadgeStylesProps {
  children: React.ReactNode;
  className?: string;
}
```

---

#### 1.3 Sidebar 컴포넌트

**파일**: `src/sidebar.tsx`
**라인**: 84-86

**현재 구현 (위반)**:
```typescript
// ❌ T prefix 없음
type SidebarVariantProps = VariantProps<typeof sidebarVariants>;
type NavItemVariantProps = VariantProps<typeof navItemVariants>;
type UserMenuVariantProps = VariantProps<typeof userMenuVariants>;

export interface SidebarProps
  extends React.HTMLAttributes<HTMLElement>,
    SidebarVariantProps {
  children: React.ReactNode;
}
```

**권장 수정**:
```typescript
// ✅ T prefix 추가
type TSidebarVariantProps = VariantProps<typeof sidebarVariants>;
type TNavItemVariantProps = VariantProps<typeof navItemVariants>;
type TUserMenuVariantProps = VariantProps<typeof userMenuVariants>;

export interface SidebarProps
  extends React.HTMLAttributes<HTMLElement>,
    TSidebarVariantProps {
  children: React.ReactNode;
}
```

---

### 2. 타입 네이밍 일관성 문제

**심각도**: LOW
**영향**: 가독성

#### 현황

일부 타입은 소문자로 시작(`buttonVariantProps`), 다른 타입은 PascalCase(`BadgeStylesProps`, `SidebarVariantProps`)를 사용하여 일관성이 부족합니다.

#### 권장 표준화

```typescript
// ✅ 모든 variant props 타입에 일관된 네이밍 적용
type TButtonVariantProps = VariantProps<typeof buttonVariants>;
type TBadgeVariantProps = VariantProps<typeof badgeVariants>;
type TSidebarVariantProps = VariantProps<typeof sidebarVariants>;
type TNavItemVariantProps = VariantProps<typeof navItemVariants>;
```

---

## 📝 위반 타입 전체 목록

| 파일 | 라인 | 현재 이름 | 올바른 이름 | 심각도 |
|------|------|-----------|-------------|--------|
| `button.tsx` | 47 | `buttonVariantProps` | `TButtonVariantProps` | Medium |
| `badge.tsx` | 44 | `BadgeStylesProps` | `TBadgeStylesProps` | Medium |
| `sidebar.tsx` | 84 | `SidebarVariantProps` | `TSidebarVariantProps` | Medium |
| `sidebar.tsx` | 85 | `NavItemVariantProps` | `TNavItemVariantProps` | Medium |
| `sidebar.tsx` | 86 | `UserMenuVariantProps` | `TUserMenuVariantProps` | Medium |

---

## ✅ 긍정적인 발견사항

### 강점

1. **React Aria Components 사용** ✅

   접근성이 보장된 컴포넌트 사용:

   ```typescript
   // button.tsx
   import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

   export function Button(props: ButtonProps) {
     return (
       <AriaButton
         {...props}
         className={buttonVariants({
           variant: props.variant,
           size: props.size,
           className: props.className,
         })}
       >
         {props.children}
       </AriaButton>
     );
   }
   ```

2. **타입 안전성** ✅

   - 모든 컴포넌트에 명시적 타입 정의
   - `any` 타입 사용 없음
   - Props 인터페이스 명확히 정의

   ```typescript
   export interface ButtonProps
     extends AriaButtonProps,
       buttonVariantProps {
     children?: React.ReactNode;
   }
   ```

3. **컴포넌트 네이밍** ✅

   모든 컴포넌트가 PascalCase 사용:
   - `Button`
   - `TextField`
   - `Badge`
   - `Sidebar`
   - `Conversation`
   - `PromptInput`

4. **파일 네이밍** ✅

   모든 파일이 kebab-case 사용:
   - `button.tsx`
   - `text-field.tsx`
   - `badge.tsx`
   - `sidebar.tsx`
   - `conversation.tsx`
   - `prompt-input.tsx`

5. **Variant 패턴 사용** ✅

   Class Variance Authority (CVA)를 사용한 일관된 스타일 관리:

   ```typescript
   const buttonVariants = cva("button-base", {
     variants: {
       variant: {
         primary: "bg-blue-500 text-white",
         secondary: "bg-gray-200 text-gray-900",
       },
       size: {
         sm: "px-2 py-1 text-sm",
         md: "px-4 py-2 text-base",
         lg: "px-6 py-3 text-lg",
       },
     },
     defaultVariants: {
       variant: "primary",
       size: "md",
     },
   });
   ```

6. **Props 확장 패턴** ✅

   React Aria의 Props를 적절히 확장:

   ```typescript
   export interface ButtonProps
     extends AriaButtonProps,  // React Aria props 상속
       TButtonVariantProps {   // Variant props 추가
     children?: React.ReactNode;
   }
   ```

7. **Export 구조** ✅

   깔끔한 export 구조:

   ```typescript
   // src/index.ts
   export { Button } from "./button";
   export type { ButtonProps } from "./button";
   export { TextField } from "./text-field";
   export type { TextFieldProps } from "./text-field";
   // ...
   ```

---

## 📁 컴포넌트 구조

### 현재 컴포넌트 목록

```
packages/ui/src/
├── button.tsx              # 버튼 컴포넌트
├── text-field.tsx          # 텍스트 입력 필드
├── badge.tsx               # 배지
├── sidebar.tsx             # 사이드바 (Sidebar, NavItem, UserMenu)
├── conversation.tsx        # 대화 컴포넌트
├── prompt-input.tsx        # 프롬프트 입력
├── ai-elements/            # AI 관련 컴포넌트
│   └── ...
└── index.ts                # 통합 export
```

---

## 🔄 리팩토링 가이드

### 단계별 타입 네이밍 수정

#### 1단계: Button 컴포넌트

```typescript
// src/button.tsx

// Before
type buttonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends AriaButtonProps,
    buttonVariantProps {
  children?: React.ReactNode;
}

// After
type TButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends AriaButtonProps,
    TButtonVariantProps {
  children?: React.ReactNode;
}
```

#### 2단계: Badge 컴포넌트

```typescript
// src/badge.tsx

// Before
type BadgeStylesProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps extends BadgeStylesProps {
  children: React.ReactNode;
  className?: string;
}

// After
type TBadgeStylesProps = VariantProps<typeof badgeVariants>;

export interface BadgeProps extends TBadgeStylesProps {
  children: React.ReactNode;
  className?: string;
}
```

#### 3단계: Sidebar 컴포넌트

```typescript
// src/sidebar.tsx

// Before
type SidebarVariantProps = VariantProps<typeof sidebarVariants>;
type NavItemVariantProps = VariantProps<typeof navItemVariants>;
type UserMenuVariantProps = VariantProps<typeof userMenuVariants>;

// After
type TSidebarVariantProps = VariantProps<typeof sidebarVariants>;
type TNavItemVariantProps = VariantProps<typeof navItemVariants>;
type TUserMenuVariantProps = VariantProps<typeof userMenuVariants>;
```

---

## 🎯 우선순위별 권장사항

### 단기 (이번 스프린트)

1. ✅ `button.tsx`의 `buttonVariantProps` → `TButtonVariantProps`
2. ✅ `badge.tsx`의 `BadgeStylesProps` → `TBadgeStylesProps`
3. ✅ `sidebar.tsx`의 모든 variant props 타입에 T prefix 추가

### 중기 (다음 스프린트)

4. ✅ 다른 컴포넌트 파일들에서 유사한 패턴 검색 및 수정
5. ✅ ESLint 규칙이 올바르게 적용되는지 확인 (T prefix 강제)

### 장기 (백로그)

6. ✅ Storybook에서 컴포넌트 문서화 강화
7. ✅ 컴포넌트 단위 테스트 추가

---

## 🧪 검증 방법

### 타입 체크

```bash
# UI 패키지 타입 체크
pnpm --filter @repo/ui check-types

# 전체 프로젝트 타입 체크
pnpm check-types
```

### ESLint 검증

```bash
# UI 패키지 린트
pnpm --filter @repo/ui lint

# 린트 자동 수정
pnpm --filter @repo/ui lint:fix
```

### 빌드 확인

```bash
# UI 패키지 빌드
pnpm --filter @repo/ui build

# Storybook 빌드
pnpm --filter storybook build
```

---

## 📚 컴포넌트 개발 가이드

### 새 컴포넌트 추가 시

1. **파일 생성**
   ```bash
   # kebab-case 파일명 사용
   touch packages/ui/src/new-component.tsx
   ```

2. **컴포넌트 구조**
   ```typescript
   // src/new-component.tsx
   import { cva, type VariantProps } from "class-variance-authority";
   import { type ReactNode } from "react";

   // Variants 정의
   const newComponentVariants = cva("base-styles", {
     variants: {
       variant: {
         primary: "primary-styles",
         secondary: "secondary-styles",
       },
       size: {
         sm: "small-styles",
         md: "medium-styles",
       },
     },
     defaultVariants: {
       variant: "primary",
       size: "md",
     },
   });

   // ✅ Variant Props 타입 (T prefix 사용)
   type TNewComponentVariantProps = VariantProps<typeof newComponentVariants>;

   // ✅ Component Props 인터페이스
   export interface NewComponentProps extends TNewComponentVariantProps {
     children?: ReactNode;
     className?: string;
   }

   // ✅ Component 구현
   export function NewComponent({
     variant,
     size,
     children,
     className,
     ...props
   }: NewComponentProps) {
     return (
       <div
         className={newComponentVariants({ variant, size, className })}
         {...props}
       >
         {children}
       </div>
     );
   }
   ```

3. **Export 추가**
   ```typescript
   // src/index.ts
   export { NewComponent } from "./new-component";
   export type { NewComponentProps } from "./new-component";
   ```

4. **Storybook 스토리 추가**
   ```typescript
   // stories/new-component.stories.tsx
   import type { Meta, StoryObj } from "@storybook/react";
   import { NewComponent } from "@repo/ui/new-component";

   const meta: Meta<typeof NewComponent> = {
     title: "Components/NewComponent",
     component: NewComponent,
   };

   export default meta;
   type Story = StoryObj<typeof NewComponent>;

   export const Primary: Story = {
     args: {
       variant: "primary",
       children: "New Component",
     },
   };
   ```

---

## 📊 컴포넌트 메트릭스

### 컴포넌트 수

| 카테고리 | 개수 (추정) |
|----------|-------------|
| 기본 컴포넌트 | 6-8 |
| AI 컴포넌트 | 3-5 |
| 전체 | 10-15 |

### 타입 안전성

| 메트릭 | 값 |
|--------|-----|
| any 타입 사용 | 0 |
| 명시적 Props 인터페이스 | 100% |
| TypeScript Strict Mode | ✅ |

---

## 🔍 코드 품질 체크리스트

### 필수 사항

- [x] React Aria Components 사용
- [x] 명시적 타입 정의
- [x] PascalCase 컴포넌트 네이밍
- [x] kebab-case 파일 네이밍
- [ ] **T prefix 타입 네이밍** ⚠️ (수정 필요)
- [x] Props 인터페이스 export
- [x] no `any` 타입

### 권장 사항

- [x] CVA를 사용한 variant 관리
- [x] 깔끔한 export 구조
- [ ] 컴포넌트 문서화 (Storybook) - 진행 중
- [ ] 단위 테스트 - 필요 시 추가

---

## 🎉 결론

UI 패키지는 **접근성과 타입 안전성이 뛰어난 컴포넌트 라이브러리**입니다. React Aria Components를 기반으로 하여 우수한 사용자 경험을 제공하며, 일관된 스타일 관리를 위한 CVA 패턴을 잘 활용하고 있습니다.

**강점**:
- ✅ 우수한 접근성 (React Aria)
- ✅ 강력한 타입 안전성
- ✅ 일관된 컴포넌트 구조
- ✅ 깔끔한 파일/컴포넌트 네이밍
- ✅ CVA를 통한 효과적인 스타일 관리

**개선 필요**:
- ⚠️ 타입 네이밍 규칙 (T prefix) 적용
- 📝 컴포넌트 문서화 강화 (선택사항)

**전체 평가**: B+ (좋은 구현, 타입 네이밍 규칙 개선 필요)

---

**최종 업데이트**: 2025-11-17
**다음 리뷰**: 타입 네이밍 수정 후
