# Conventions

## Naming Conventions

### Files & Directories

- **kebab-case**를 기본으로 사용합니다.
  - `user-profile.tsx` (O)
  - `UserProfile.tsx` (X)
  - `userProfile.tsx` (X)

### Components

- **PascalCase**를 사용합니다.
  - `function UserProfile() { ... }`

### Hooks

- **camelCase**를 사용하며, 접두사 `use`로 시작해야 합니다.
  - `useAuth()`, `useWindowSize()`

### Variables & Functions

- **camelCase**를 사용합니다.
  - `const isLoading = true;`
  - `function handleSubmit() { ... }`

### Types & Interfaces

- **PascalCase**를 사용합니다.
  - `interface UserProps { ... }`
  - `type AuthState = ...`

## Code Organization (Component)

컴포넌트 파일 내 코드는 다음 순서로 배치하는 것을 권장합니다.

1. **Imports**: 외부 라이브러리 -> 절대 경로(`~/...`) -> 상대 경로
2. **Types/Interfaces**: 해당 파일 전용 타입 정의
3. **Component Definition**: export 할 메인 컴포넌트
   - Hooks (State, Query, Effect)
   - Event Handlers
   - Render Logic (JSX)
4. **Sub-components**: 파일 내에서만 사용되는 작은 하위 컴포넌트 (필요한 경우)

## Imports

상대 경로(`../../`) 대신 절대 경로 별칭(`~/`) 사용을 권장합니다.

- `~/domains/...`
- `~/foundation/...`
- `~/routes/...`

단, 동일 도메인 내부에서의 참조는 상대 경로가 허용됩니다.
