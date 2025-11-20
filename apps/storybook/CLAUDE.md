# apps/storybook

@repo/ui 컴포넌트 개발 환경

## Purpose

- 독립적인 컴포넌트 개발 및 테스트
- 인터랙티브 문서화
- 접근성 테스트 (a11y addon)

## Tech Stack

- **Storybook**: v10
- **Vite**: 빌드 도구
- **Addons**: docs, a11y, themes, links

## Important Rules

1. **컴포넌트는 @repo/ui에서 import** - 로컬 구현 금지
2. **tags: ["autodocs"]** 필수 - 자동 문서 생성
3. **접근성 테스트** - a11y 패널에서 확인
4. **스토리는 variants별로** - Primary, Secondary, Disabled 등

## Story Structure

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@repo/ui/button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Button", variant: "primary" },
};
```

## Workflow

1. @repo/ui에 컴포넌트 구현
2. Storybook에서 스토리 작성
3. `pnpm --filter storybook dev` 실행 (port 6006)
4. 브라우저에서 테스트 및 문서 확인
5. a11y 패널에서 접근성 검증

## Design Note

- CSS import는 `.storybook/preview.ts`에서
- 컴포넌트 변경 시 HMR 자동 반영
- 정적 빌드: `pnpm build` → `storybook-static/`
