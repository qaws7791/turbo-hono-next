# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

## Project Setup

### ESLint

- [eslint v9 is used flat config `eslint.config.js`](https://eslint.org/docs/latest/use/configure/configuration-files)
- `eslintrc.js` file is deprecated. don't use it.

below is an example of using the `nextJsConfig` from the `@repo/eslint-config/next` package in next.js application.

```js
// eslint.config.js
import { nextJsConfig } from "@repo/eslint-config/next";

/** @type {import("eslint").Linter.Config} */
export default nextJsConfig;
```

## Commit Convention

See @commitlint/config-conventional

### Example

```bash
git commit -m "feat: add new feature"
```

### Type-Enum

- `build`
- `chore`
- `ci`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`
- `test`

## See best practices, checklists, guides, etc

- [Nodejs Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [building production ready React applications](https://github.com/alan2207/bulletproof-react)
- [frontend checklist](https://github.com/thedaviddias/Front-End-Checklist)
- [nextjs production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [OWASP cheat sheet series](https://cheatsheetseries.owasp.org/)
- [Toss Frontend Fundamentals](https://github.com/toss/frontend-fundamentals)
- [React Typescript Cheatsheet](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet)
- [backend-cheatsheet](https://github.com/cheatsnake/backend-cheats)
- [awesome-scalability](https://github.com/binhnguyennus/awesome-scalability)
- [The Copenhagen Book](https://github.com/pilcrowonpaper/copenhagen)
- [Professional Programming](https://github.com/charlax/professional-programming)
- [system design](https://github.com/karanpratapsingh/system-design)
- [explain monorepo by nx](https://monorepo.tools)
- [angular style guide](https://github.com/johnpapa/angular-styleguide)

## Tailwind AutoComplete Problem in VSCode

- Check `.vscode/settings.json` > `tailwindCSS.experimental.configFile` for the correct configuration.
- [Tailwind CSS IntelliSense Docs](https://github.com/tailwindlabs/tailwindcss-intellisense?tab=readme-ov-file#tailwind-css-v4x-css-entrypoints)

## API First 개발 가이드

- **단일 진실의 원천 유지**: 모든 API 스펙은 `@repo/api-spec` 패키지(`packages/api-spec/src/modules`)에서 관리합니다. 새로운 엔드포인트를 추가할 때는 반드시 이 패키지에 `schema`(Zod)와 `route`(createRoute) 정의를 추가한 뒤, 해당 모듈의 `routes/index.ts`에 포함시켜 주세요.
- **백엔드 라우터 연동**: `apps/api`에서는 기존처럼 `OpenAPIHono`를 사용하되, 스펙 패키지에서 export한 `route`/`schema`를 가져와 미들웨어와 핸들러만 주입합니다. 핸들러 내부에서 `c.req.valid(...)` 등 런타임 검증도 동일하게 유지합니다.
- **문서/클라이언트 타입 동기화**: 스펙을 변경했다면 루트에서 `pnpm --filter @repo/api-spec docs:generate`로 OpenAPI JSON을 생성하고, 이어서 `pnpm --filter web schema:generate`를 실행해 프론트엔드 타입을 재생성합니다. CI에도 동일한 흐름을 추가하여 드리프트를 방지합니다.
- **보안 설정과 공통 스키마**: `packages/api-spec/src/openapi.ts`에서 보안 스키마(cookieAuth)와 공통 정보가 등록됩니다. 공통 응답/오류 스키마는 각 모듈 `schema.ts`에 위치시키고 재사용하세요.
- **검증 및 테스트**: 스펙과 구현이 동기화되었는지 확인하기 위해 API 스펙 생성 후 `apps/api`의 테스트·타입 체크(`pnpm --filter api test`, `pnpm --filter api check-types`)를 수행하고, 프론트엔드 역시 `pnpm --filter web build` 등 필요한 검증을 실행해 주세요. 스펙 JSON이 변경되었는지 `git status`로 확인하여 커밋에 포함합니다.
