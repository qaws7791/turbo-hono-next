# @repo/ui

React 컴포넌트 라이브러리 (React Aria Components + Tailwind CSS v4)

## Purpose

- 접근성 우선 UI 컴포넌트
- 디자인 시스템 통일
- Storybook에서 개발 후 앱에서 사용

## Component Categories

- **button**: Button, ButtonGroup
- **form**: TextField, Checkbox, RadioGroup, Select, Slider, Switch
- **date**: DateField, DatePicker, Calendar
- **overlay**: Dialog, Popover, Tooltip
- **feedback**: Toast, ProgressBar, LoadingSpinner
- **layout**: Card, Separator, Sidebar, ScrollArea
- **navigation**: Link, Menu, Tabs
- **display**: Badge, Icon, CodeBlock
- **interaction**: Disclosure, ListBox
- **ai**: AI 채팅 관련 컴포넌트

## Important Rules

1. **React Aria Components 기반** - 접근성 자동 보장
2. **Subpath imports 사용**: `@repo/ui/button` (트리쉐이킹)
3. **className prop 항상 지원** - 사용자 커스터마이징 허용
4. **Tailwind variants 사용** - `tailwind-variants` 패키지
5. **Storybook에서 먼저 개발** - 독립적으로 테스트 후 통합

## Component Structure

```
components/[category]/[component-name]/
  ├── index.ts              # Exports
  ├── [name].tsx            # 구현
  ├── [name].types.ts       # Props 타입
  └── [name].styles.ts      # Tailwind variants (선택)
```

## Adding New Component

1. `src/components/[category]/[name]/` 생성
2. React Aria Component 기반으로 구현
3. `package.json`에 subpath export 추가
4. Storybook 스토리 작성 (`apps/storybook`)
5. `pnpm --filter @repo/ui build` 실행

## Design Note

- 모든 컴포넌트는 keyboard navigation 지원
- WCAG 2.1 AA 준수
- 앱에서 사용 시 CSS import 필수: `@repo/ui/components.css`
