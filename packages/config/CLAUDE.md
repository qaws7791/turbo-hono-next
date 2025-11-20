# @repo/config

공유 설정 - ESLint, Prettier, TypeScript

## Purpose

모든 워크스페이스에서 일관된 코드 품질 및 스타일 유지

## Available Configs

### ESLint

- `@repo/config/eslint/base` - Node.js/TypeScript 기본
- `@repo/config/eslint/react` - React 프로젝트용

### Prettier

- `@repo/config/prettier` - 통일된 포맷팅

### TypeScript

- `@repo/config/tsconfig/base` - 기본
- `@repo/config/tsconfig/hono` - Backend (apps/api)
- `@repo/config/tsconfig/react-app` - React 앱 (apps/web)
- `@repo/config/tsconfig/react-library` - React 라이브러리 (packages/ui)

## Important Rules

1. **Strict TypeScript** - 모든 설정에서 strict mode 활성화
2. **No `any` types** - ESLint가 `any` 사용 금지
3. **Import sorting** - ESLint가 자동 정렬
4. **공유 설정 확장만** - 프로젝트별 규칙 추가는 최소화

## Usage

```javascript
// eslint.config.js
import baseConfig from "@repo/config/eslint/base";
export default [...baseConfig];

// tsconfig.json
{ "extends": "@repo/config/tsconfig/base.json" }
```

## Design Note

설정 업데이트 시 모든 워크스페이스에서 테스트 필수
