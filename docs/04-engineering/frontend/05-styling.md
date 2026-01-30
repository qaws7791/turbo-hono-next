# Styling & UI

## Technology Stack

- **Tailwind CSS v4**: 유틸리티 퍼스트 CSS 프레임워크
- **@repo/ui**: 사내 디자인 시스템 패키지 (Monorepo shared package)
- **Lucide React / Tabler Icons**: 아이콘 라이브러리

## @repo/ui Package

UI 컴포넌트는 `packages/ui` 디렉토리에서 별도 워크스페이스 패키지로 관리됩니다. 이는 `apps/web` 뿐만 아니라 향후 추가될 수 있는 다른 앱에서도 동일한 디자인 시스템을 사용하기 위함입니다.

- **Import**:

  ```tsx
  import { Button } from "@repo/ui/button";
  import { Card, CardHeader } from "@repo/ui/card";
  ```

- **Styling Customization**:
  대부분의 UI 컴포넌트는 `className` prop을 통해 Tailwind 클래스를 추가하여 스타일을 확장하거나 덮어쓸 수 있도록 설계되었습니다 (`cn()` 유틸리티 사용).

## Tailwind CSS Usage

v4 버전을 사용하므로 별도의 `tailwind.config.js` 없이 CSS 파일(`apps/web/src/app/styles/app.css`) 내의 `@theme` 지시어를 통해 테마를 설정합니다.

```css
@import "tailwindcss";

@theme {
  --color-brand-500: #3b82f6;
  /* ... */
}
```

## Responsive Design

모바일 우선(Mobile First) 원칙을 따릅니다. 기본 스타일은 모바일용으로 작성하고, `md:`, `lg:` 등의 브레이크포인트 접두사를 사용하여 데스크탑 스타일을 정의합니다.
