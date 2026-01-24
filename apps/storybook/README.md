# Storybook - UI 컴포넌트 개발 환경

이 Storybook 앱은 `@repo/ui` 패키지의 공유 컴포넌트 라이브러리를 개발하고 문서화하기 위한 독립적인 개발 환경입니다.

## 목적

- **컴포넌트 격리 개발**: 비즈니스 로직과 분리하여 UI 컴포넌트를 독립적으로 개발
- **시각적 문서화**: 모든 컴포넌트 상태와 변형(variant)을 시각적으로 문서화
- **접근성 테스트**: 접근성 애드온을 통한 WCAG 준수 검증
- **디자인 시스템**: 일관된 디자인 시스템 구축 및 공유

## 기술 스택

### 핵심 기술

- **Storybook 9.1**: 컴포넌트 개발 및 문서화 도구
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구 및 개발 서버

### 스타일링

- **Tailwind CSS v4**: 유틸리티 기반 CSS 프레임워크
- **@tailwindcss/vite**: Vite를 위한 Tailwind CSS 플러그인

### Storybook 애드온

- **@storybook/addon-a11y**: 접근성 검사 도구
- **@storybook/addon-docs**: 자동 문서 생성
- **@storybook/addon-themes**: 다크 모드 및 테마 전환
- **@storybook/addon-links**: 스토리 간 내비게이션

### 컴포넌트 기반

- **React Aria Components**: 접근 가능한 UI 컴포넌트 라이브러리
- **JollyUI 디자인 패턴**: shadcn/ui 스타일의 접근성 우선 디자인

## 프로젝트 구조

```
apps/storybook/
├── .storybook/          # Storybook 설정
│   ├── main.ts         # 메인 설정 (애드온, 빌드 설정)
│   └── preview.ts      # 프리뷰 설정 (전역 데코레이터, 테마)
├── src/
│   ├── stories/        # 컴포넌트 스토리 파일
│   │   ├── button.stories.tsx
│   │   ├── card.stories.tsx
│   │   ├── dialog.stories.tsx
│   │   └── ...
│   └── styles/
│       └── globals.css # 전역 스타일 (Tailwind CSS 임포트)
├── package.json
├── vite.config.ts
├── README.md           # 이 파일
└── STORYBOOK_GUIDELINES.md  # 스토리 작성 가이드라인
```

## 시작하기

### 개발 서버 실행

```bash
# 프로젝트 루트에서 실행
pnpm --filter storybook dev

# 또는 모든 개발 서버 실행 (web, api, storybook)
pnpm dev
```

개발 서버가 시작되면 브라우저에서 http://localhost:6006 으로 접속할 수 있습니다.

### 빌드

```bash
# 정적 파일로 빌드
pnpm --filter storybook build

# 빌드된 파일은 storybook-static/ 디렉터리에 생성됩니다
```

### 타입 체크

```bash
pnpm --filter storybook typecheck
```

### 린트

```bash
pnpm --filter storybook lint
```

## 스토리 작성 가이드

자세한 스토리 작성 가이드라인은 [STORYBOOK_GUIDELINES.md](./STORYBOOK_GUIDELINES.md)를 참고하세요.

### 기본 구조

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@repo/ui/button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
  },
};
```

### 스토리 작성 원칙

1. **접근성 우선**: 모든 스토리는 접근 가능한 사용 패턴을 보여줘야 합니다
2. **변형 커버리지**: 모든 컴포넌트 변형, 크기, 상태를 문서화합니다
3. **실제 사용 예시**: 실용적인 사용 사례와 조합 패턴을 제공합니다
4. **타입 안전성**: 모든 props에 대해 적절한 TypeScript 타입을 사용합니다

## 컴포넌트 카테고리

### 1. React Aria 컴포넌트

**예시**: Button, Checkbox, TextField, Select, DatePicker

**특징**:

- `react-aria-components` 기반
- 내장된 접근성 기능
- 폼 검증 지원
- 렌더 props 패턴 사용

### 2. 기본 React 컴포넌트

**예시**: Card, Badge, LoadingSpinner

**특징**:

- 표준 React 컴포넌트
- 복합 컴포넌트 패턴 사용 가능
- Tailwind CSS로 스타일링

### 3. 복잡한 오버레이 컴포넌트

**예시**: Dialog, Popover, Tooltip, Toast

**특징**:

- 포털 기반 렌더링
- 포커스 관리 및 키보드 인터랙션
- 위치 및 애니메이션 지원

## 접근성 기능

Storybook에는 `@storybook/addon-a11y` 애드온이 포함되어 있어 다음을 자동으로 검사합니다:

- **WCAG 2.1 규칙 준수**: 색상 대비, 포커스 표시 등
- **ARIA 속성 검증**: 올바른 role, label 사용 확인
- **키보드 내비게이션**: 키보드로 접근 가능한지 확인
- **스크린 리더 호환성**: 의미 있는 발표(announcement) 확인

각 스토리의 "Accessibility" 탭에서 검사 결과를 확인할 수 있습니다.

## 다크 모드 지원

`@storybook/addon-themes` 애드온을 통해 라이트/다크 모드를 전환할 수 있습니다.

- 툴바의 테마 아이콘을 클릭하여 전환
- 모든 컴포넌트는 다크 모드를 지원하도록 설계됨

## 개발 워크플로우

### 새 컴포넌트 추가하기

1. **`@repo/ui`에서 컴포넌트 개발**

   ```bash
   # packages/ui/src/components/common/new-component.tsx
   ```

2. **Storybook에 스토리 추가**

   ```bash
   # apps/storybook/src/stories/new-component.stories.tsx
   ```

3. **Storybook에서 개발 및 테스트**

   ```bash
   pnpm --filter storybook dev
   ```

4. **UI 패키지 빌드**

   ```bash
   pnpm --filter @repo/ui build
   ```

5. **web 앱에서 사용**
   ```typescript
   import { NewComponent } from "@repo/ui/new-component";
   ```

### 기존 컴포넌트 수정하기

1. `@repo/ui`에서 컴포넌트 수정
2. Storybook이 핫 리로드(HMR)로 자동 반영
3. 모든 변형과 상태 확인
4. UI 패키지 리빌드
5. web 앱에 자동 반영

## 참고 자료

### 공식 문서

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- [JollyUI](https://www.jollyui.dev/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### 접근성

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Aria Accessibility](https://react-spectrum.adobe.com/react-aria/accessibility.html)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### 디자인 시스템

- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Material Design](https://m3.material.io/)

## 문제 해결

### Tailwind IntelliSense가 작동하지 않는 경우

`.vscode/settings.json` 파일을 확인하세요:

```json
{
  "tailwindCSS.experimental.configFile": "src/styles/globals.css"
}
```

자세한 내용은 [Tailwind CSS IntelliSense docs](https://github.com/tailwindlabs/tailwindcss-intellisense?tab=readme-ov-file#tailwind-css-v4x-css-entrypoints)를 참고하세요.

### 컴포넌트 임포트 오류

`@repo/ui` 패키지가 빌드되었는지 확인하세요:

```bash
pnpm --filter @repo/ui build
```

### 스토리가 표시되지 않는 경우

1. 스토리 파일이 `.stories.tsx` 확장자를 사용하는지 확인
2. 기본 export가 올바른 메타 객체인지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 기여 가이드

새로운 스토리를 작성하거나 기존 스토리를 수정할 때는 다음을 확인하세요:

- [ ] 모든 컴포넌트 변형이 문서화되어 있는가?
- [ ] 접근성 검사를 통과하는가?
- [ ] 키보드 내비게이션이 작동하는가?
- [ ] 다크 모드에서 올바르게 표시되는가?
- [ ] 에러 상태와 엣지 케이스가 포함되어 있는가?
- [ ] 실제 사용 예시가 제공되는가?

자세한 가이드라인은 [STORYBOOK_GUIDELINES.md](./STORYBOOK_GUIDELINES.md)를 참고하세요.
