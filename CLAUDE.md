# AGENTS.md & CLAUDE.md

This file provides guidance to AI when working with code in this repository.

## Project Overview

This is a **learning roadmap service** built as a **Turborepo monorepo** using **pnpm workspaces**. The project helps developers create personalized learning paths with AI-generated roadmaps, kanban-style goal tracking, and integrated learning history.

**Target Users**: Junior developers and career switchers seeking structured learning paths; senior developers learning new technology stacks.

## Monorepo Structure

- **`apps/api`**: Hono.js backend API with Drizzle ORM, Neon DB, cookie-based authentication, and Vercel AI SDK (Google Gemini)
- **`apps/web`**: Vite + TanStack Router frontend with React 19, TypeScript, React Aria Components, Tailwind CSS, TanStack Query, and Zustand
- **`apps/storybook`**: Component development environment for `@repo/ui`
- **`packages/database`**: Shared Drizzle ORM schema and database client (Neon DB)
- **`packages/api-spec`**: Single source of truth for API specifications using Zod schemas and Hono OpenAPI routes
- **`packages/ui`**: Shared React component library with AI chat components
- **`packages/ai-types`**: Shared AI SDK v5 type definitions (message, tools, metadata)
- **`packages/config`**: Shared ESLint, Prettier, TypeScript configurations

## Key Commands

### Development

```bash
# Install dependencies after clone or lockfile changes
pnpm install

# Start all development servers (API, web, storybook)
pnpm dev

# Start specific workspace
pnpm --filter web dev     # Frontend on port 4000
pnpm --filter api dev     # Backend API
pnpm --filter storybook dev

# After changing shared UI components
pnpm --filter @repo/ui build
```

### Database (Drizzle ORM)

```bash
# Generate migration files after schema changes in packages/database/src/schema.ts
pnpm --filter @repo/database db:generate

# Push schema changes to Neon DB
pnpm --filter @repo/database db:push

# Open Drizzle Studio for database inspection
pnpm --filter @repo/database db:studio
```

**IMPORTANT**: Never manually edit files in `packages/database/migrations`. Always use `db:generate` to create migrations.

### API Specification Workflow

This project follows an **API-first approach** with a single source of truth in `packages/api-spec`:

1. **Define API specs** in `packages/api-spec/src/modules/*/schema.ts` (Zod schemas) and `packages/api-spec/src/modules/*/routes.ts` (createRoute definitions)
2. **Register routes** in the module's `routes/index.ts`
3. **Generate OpenAPI documentation**: `pnpm --filter @repo/api-spec docs:generate` (creates `packages/api-spec/dist/openapi.json`)
4. **Generate frontend types**: `pnpm --filter web schema:generate` (creates `apps/web/src/api/schema.ts`)

**After any API spec change**:

```bash
pnpm --filter api dev                    # Start backend (auto-updates OpenAPI)
pnpm --filter web schema:generate        # Regenerate frontend types
```

This workflow ensures type safety between frontend and backend, with runtime validation via `c.req.valid(...)` in handlers.

### Code Quality

```bash
# Lint all workspaces
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Type checking
pnpm check-types

# Format all TypeScript and markdown files
pnpm format
```

### Build and Deploy

```bash
# Build all apps and packages
pnpm build

# Deploy (requires AWS credentials)
pnpm deploy

# Deploy API only
pnpm deploy:api
```

## Architecture Highlights

### Backend (`apps/api`)

- **Framework**: Hono.js with `@hono/zod-openapi` for type-safe routing
- **Database**: Neon DB (serverless Postgres) via Drizzle ORM
- **Authentication**: Cookie-based sessions stored in database
- **AI Integration**: Vercel AI SDK v5 with Google Gemini (@ai-sdk/google) for:
  - Learning plan generation
  - Learning task notes and quizzes
  - AI tutor chat with tool calling (learning module/task management)
  - Streaming responses with structured outputs
- **File Storage**: AWS S3 (or Cloudflare R2) for document uploads
- **API Documentation**: Auto-generated via Scalar UI from OpenAPI spec (Korean language)
- **Logging**: Pino logger with structured logging
- **Architecture Pattern**: Repository pattern with CQRS (Command Query Responsibility Segregation)

Key directories:

- `src/modules/*`: Feature modules organized by domain
  - `routes/`: Hono OpenAPI route handlers
  - `services/`: Business logic separated into command and query services
  - `repositories/`: Data access layer
  - `errors.ts`: Module-specific errors
  - Key modules: `ai`, `ai-chat`, `auth`, `learning-plan`, `documents`, `progress`
- `src/modules/ai-chat`: AI tutor chat implementation
  - `tools/`: AI agent tools for learning plan context (query-info, learning-module, learning-task)
  - `helpers/`: Message and prompt formatting helpers
  - Implements CQRS: conversation and message command/query services
- `src/middleware`: Authentication, error handling, logging
- `src/database`: Re-exports from `@repo/database`
- `src/config`: Environment variables and app config
- `src/lib`: Shared utilities (pagination, authorization, transaction helpers)
- `src/errors`: Centralized error handling system
- `src/external`: External service integrations (email, AI providers)

### Frontend (`apps/web`)

- **Router**: TanStack Router with file-based routing in `src/routes/`
- **State Management**:
  - Server state: TanStack Query v5 with Query Key Factory pattern
  - Client state: Zustand
  - Form state: React Aria Form components (simple), React Hook Form + Zod (complex)
  - URL state: nuqs (type-safe query string management)
- **UI Components**: React Aria Components (accessible by default)
- **Styling**: Tailwind CSS v4
- **AI Integration**: @ai-sdk/react for streaming chat UI
- **API Client**: openapi-fetch for type-safe API calls (auto-generated from OpenAPI spec)
- **Multi-step Forms**: @use-funnel/browser for funnel-based UI flows

Key directories:

- `src/routes/`: File-based routes
- `src/features/`: Feature-specific logic and components
  - Each feature follows: `api/`, `hooks/`, `components/`, `model/` structure
  - Query Key Factory pattern in `api/query-keys.ts` for cache management
- `src/components/`: Reusable components
- `src/api/`: Generated OpenAPI client types and HTTP client

### Database Schema (`packages/database`)

The database schema is defined in `packages/database/src/schema.ts` using Drizzle ORM. The Drizzle configuration has been moved to the `@repo/database` package for better organization.

Key tables include:

- **Users & Auth**: `user`, `session`, `account`, `verification`
- **Learning Entities**: `learningPlan`, `learningModule`, `learningTask`
- **AI Features**:
  - Notes & Quizzes: `aiNote`, `aiQuiz`, `aiQuizResult`
  - Chat: `aiConversation`, `aiMessage` (with support for tool calls and attachments)
- **Documents**: `learningPlanDocument`

**Database operations:**

- All table names follow `camelCase` convention
- Transactions are managed via `runInTransaction()` helper
- Repository pattern abstracts data access logic

### Shared Packages

#### packages/ui

Shared React component library built with React Aria Components and Tailwind CSS v4.

**Key Features:**
- **AI Chat Components** (`src/ai/`):
  - `conversation.tsx`: Chat conversation container with message display
  - `message.tsx`: Message component with markdown rendering and tool results
  - `prompt-input.tsx`: Rich text input with attachments and suggestions
  - `tool-execution-card.tsx`, `tool-invocation.tsx`, `tool-results.tsx`: Tool calling visualization
  - Hooks: `use-conversations`, `use-messages`, `use-stream-message`
- **Core UI Components** (30+ components):
  - Form controls: button, text-field, select, checkbox, switch, radio-group, etc.
  - Data display: card, badge, tooltip, progress-bar, tabs, etc.
  - Overlays: dialog, popover, menu, etc.
  - Layout: disclosure, scroll-area, separator, sidebar
- **Accessibility**: All components built with React Aria Components for WCAG compliance
- **Styling**: Tailwind CSS v4 with `tailwind-variants` for component variations
- **Markdown**: `react-markdown` with syntax highlighting (`rehype-highlight`)
- **Streaming Support**: `streamdown` for real-time markdown streaming

**Key Dependencies:**
- `@repo/ai-types`: Shared AI SDK v5 types
- `react-aria-components`: Accessible component primitives
- `lucide-react`: Icon library
- `motion`: Animation library
- `use-stick-to-bottom`: Auto-scroll for chat interfaces

#### packages/ai-types

Central type definitions for Vercel AI SDK v5, shared across backend and frontend.

**Exports:**
- `message.ts`: Message types (CoreMessage, CoreAssistantMessage, etc.)
- `metadata.ts`: Metadata and annotation types
- `data-parts.ts`: Data stream part types
- `tools.ts`: Tool definition and execution types (ToolInvocation, ToolResult, etc.)

**Purpose:**
- Ensures type consistency between `apps/api`, `apps/web`, and `packages/ui`
- Centralizes AI SDK v5 type definitions for easy updates
- Supports advanced features: tool calling, streaming, structured outputs

#### packages/api-spec

API specification as the single source of truth using Zod schemas and Hono OpenAPI routes.

**Structure:**
- `src/modules/*/schema.ts`: Zod validation schemas
- `src/modules/*/routes.ts`: OpenAPI route definitions with `createRoute`
- `scripts/generate-doc.ts`: Generates `dist/openapi.json`
- Frontend types auto-generated via `openapi-typescript`

**Benefits:**
- Type-safe API contracts between frontend and backend
- Auto-generated API documentation (Scalar UI)
- Runtime validation with Zod
- Version control for API changes

## Development Guidelines

### API-First Development

- **All API specs** live in `packages/api-spec/src/modules`
- Backend (`apps/api`) imports routes from `@repo/api-spec` and only adds middleware/handlers
- Security schemas (e.g., cookieAuth) are configured in `packages/api-spec/src/openapi.ts`
- Always regenerate OpenAPI docs and frontend types after spec changes
- **API paths**: Follow flattened structure (e.g., `/plans` instead of `/learning-plans`)
- **API errors**: Standardized with "default" error response schema
- **API docs**: Korean language for better accessibility

### Coding Standards

- **TypeScript**: Strict mode, no `any` types
- **Formatting**: Prettier with 2-space indent, 80-char line length, trailing commas
- **Linting**: ESLint v9 flat config (`eslint.config.mjs` or `eslint.config.js`), sorted imports, unused identifier checks
- **Naming**:
  - Type parameters: PascalCase with `T` prefix (e.g., `TUser`)
  - Hooks: start with `use` (e.g., `useAuth`)
  - Files: kebab-case for modules, PascalCase for components

### Component Development

- Prefer **React Aria Components** (pre-built accessible components)
- Use **React Aria** and **React Stately** for custom accessible components
- Co-locate related modules in feature directories
- Develop UI components in Storybook (`apps/storybook`) before integrating

### State Management Patterns

- **Server data**: Always use TanStack Query (cache, refetch, optimistic updates)
  - Use Query Key Factory pattern in `features/*/api/query-keys.ts` for consistent cache key management
  - Example: `learningPlanKeys.detail(planId)` for hierarchical cache invalidation
- **Client UI state**: Zustand stores (modals, theme, user preferences)
- **Form validation**: React Hook Form + Zod for complex forms, React Aria Form for simple forms
- **URL state**: nuqs for type-safe query string parameters

### Backend Architecture Patterns

The backend follows a layered architecture with clear separation of concerns:

**Repository Pattern:**

- Repositories handle all database queries and data access
- Located in `modules/*/repositories/`
- Implement standard interfaces from `lib/repository/base.repository.ts`
- Support transactions via optional `tx` parameter
- Optimize queries to avoid N+1 problems

**CQRS Pattern:**

- Services are split into Command and Query services
- **Command services**: Handle writes (create, update, delete)
- **Query services**: Handle reads (list, get, search)
- Example: `learning-plan-command.service.ts` and `learning-plan-query.service.ts`

**Service Layer Guidelines:**

- Services contain business logic only (no direct database access)
- Use repositories for data access
- Keep services focused and under 300 lines
- Use transaction helpers for multi-step operations
- Follow naming: `{entity}-command.service.ts` and `{entity}-query.service.ts`

**Error Handling:**

- Centralized error system in `src/errors/`
- Module-specific errors extend `BaseError`
- All errors include proper HTTP status codes
- Global error handler in middleware

**Common Utilities:**

- `lib/pagination/cursor-pagination.helper.ts`: Cursor-based pagination
- `lib/authorization/ownership.helper.ts`: Resource ownership verification
- `lib/transaction.helper.ts`: Standardized transaction management

### Design Principles

Follow Clean Code and SOLID principles as documented in `AGENTS.md`:

- **Simplicity**: Choose the simplest implementation
- **Single Responsibility**: One function/class per responsibility
- **DRY**: Eliminate duplication (use shared helpers)
- **YAGNI**: Don't implement features before they're needed
- **Immutability**: Always use `const`, avoid side effects
- **Defensive Programming**: Validate all inputs with Zod, use try-catch and ErrorBoundary
- **Type Safety**: Leverage TypeScript's advanced features, no `any` types, explicit return types

### Documentation

- **Ubiquitous Language**: Document shared domain terms in `docs/ubiquitous-language.md`
- **Trade-offs**: Record architectural decisions and trade-offs in `docs/trade-off.md`
- **API Docs**: Auto-generated from OpenAPI spec, accessible at `/reference` endpoint

## Commit Conventions

Follow **Conventional Commits** with `@commitlint/config-conventional`:

```bash
git commit -m "feat: add study plan kanban view"
git commit -m "fix: resolve authentication cookie issue"
git commit -m "chore: update dependencies"
```

**Valid types**: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

Pre-commit hooks (Husky) run lint-staged for automatic linting and formatting.

## Environment Variables

Required environment variables (store in `.env.local`):

```bash
# Database
DATABASE_URL=

# Session
SESSION_COOKIE_NAME=
COOKIE_SECURE=
COOKIE_DOMAIN=

# OAuth (Kakao)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=

# Security
PASSWORD_HASH_SECRET=

# Email (Resend)
RESEND_API_KEY=
RESEND_EMAIL=

# File Storage (R2 or AWS S3)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=
R2_PUBLIC_URL=

# Frontend
FRONTEND_URL=

# Server
PORT=
NODE_ENV=
SERVICE_NAME=
```

See `turbo.json` for the complete list of environment variables used by Turborepo.

## Common Workflows

### Adding a New API Endpoint

1. Define Zod schema in `packages/api-spec/src/modules/[module]/schema.ts`
2. Create route with `createRoute` in `packages/api-spec/src/modules/[module]/routes.ts`
3. Register route in `packages/api-spec/src/modules/[module]/routes/index.ts`
4. Create or update repository in `apps/api/src/modules/[module]/repositories/`
5. Create or update service in `apps/api/src/modules/[module]/services/` (use command/query split)
6. Implement handler in `apps/api/src/modules/[module]/routes/` that uses the service
7. Run `pnpm --filter api dev` to update OpenAPI docs
8. Run `pnpm --filter web schema:generate` to regenerate frontend types
9. Verify with `pnpm check-types` in both `api` and `web`

### Modifying Database Schema

1. Edit schema in `packages/database/src/schema.ts`
2. Generate migration: `pnpm --filter @repo/database db:generate`
3. Review generated SQL in `packages/database/migrations/`
4. Apply migration: `pnpm --filter @repo/database db:push`
5. Update TypeScript types: `pnpm check-types`

### Adding a New Feature

1. Plan the feature and identify required API endpoints
2. Define API specifications in `packages/api-spec/src/modules/[module]/`
3. Create backend implementation following the layered architecture:
   - Repository for data access
   - Command/Query services for business logic
   - Route handlers for API endpoints
4. Generate OpenAPI docs and frontend types
5. Create feature module in `apps/web/src/features/[feature-name]/`
6. Add route in `apps/web/src/routes/` (file-based routing)
7. Implement frontend using generated API types
8. Run `pnpm lint` and `pnpm check-types` to verify
9. Test the feature end-to-end

### Updating Shared UI Components

1. Modify components in `packages/ui/src/`
2. Develop/test in Storybook: `pnpm --filter storybook dev`
3. Rebuild UI package: `pnpm --filter @repo/ui build`
4. Changes automatically reflected in `web` and `storybook` apps

## Testing and CI

- Run type checks before committing: `pnpm check-types`
- Lint-staged automatically formats and lints staged files
- Husky pre-commit hooks enforce quality checks
- Include API spec changes in commits: `git status` to verify `packages/api-spec/dist/openapi.json` updates

## Tailwind CSS v4 Configuration

If Tailwind IntelliSense autocomplete is not working in VSCode:

- Check `.vscode/settings.json` for `tailwindCSS.experimental.configFile`
- Refer to [Tailwind CSS IntelliSense docs](https://github.com/tailwindlabs/tailwindcss-intellisense?tab=readme-ov-file#tailwind-css-v4x-css-entrypoints)

## Reference Resources

See `README.md` for links to best practices, checklists, and guides including:

- Node.js Best Practices
- Bulletproof React
- Frontend Checklist
- OWASP Cheat Sheet Series
- Toss Frontend Fundamentals
- React TypeScript Cheatsheet
- The Copenhagen Book (authentication)
