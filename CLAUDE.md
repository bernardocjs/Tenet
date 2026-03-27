# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with hot-reload (tsx watch)
npm run build        # Compile TypeScript to dist/ (tsc + tsc-alias for path resolution)
npm start            # Run compiled production build

npm run lint         # ESLint on src/
npm run lint:fix     # Auto-fix linting issues

npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Run tests with Vitest UI dashboard
```

To run a single test file:
```bash
npx vitest run tests/usecases/create-shipment.test.ts
```

## Architecture

Clean architecture with dependency injection: **Routes → Controllers → Use Cases → Repositories/Providers**

- Use cases contain all business logic, depend on interfaces (never Prisma directly)
- Controllers wire the dependency graph and handle HTTP request/response
- Error hierarchy: `AppError` → `NotFoundError` (404), `BadRequestError` (400), `ExternalServiceError` (503)
- Zod schemas in `src/dtos/` validate before use cases; errors caught by global middleware

Detailed rules: `.claude/rules/clean-architecture.md` | `.claude/rules/error-handling.md` | `.claude/rules/api-design.md`

## Database

- Prisma ORM, PostgreSQL. Client singleton: `src/lib/prisma.ts`
- Dev migrations: `npx prisma migrate dev --name <desc>`
- Production: `npx prisma migrate deploy`

## Testing

- Vitest + `vitest-mock-extended`. Tests in `tests/` mirroring `src/` structure.
- Mock all dependencies with `mockDeep<T>()`, reset in `beforeEach` with `mockReset()`
- Coverage: `npm run test:coverage`

Detailed rules: `.claude/rules/testing.md`

## Skills (slash commands)

- `/feature <description>` — implement feature end-to-end with tests + SRE review
- `/add-endpoint <METHOD> <path> - <description>` — add REST endpoint following project patterns
- `/review` — multi-agent code review (backend + SRE) against git diff
- `/prod-check` — full production readiness audit (lint + tests + build + SRE + DevOps)

## Environment

Copy `.env.example` to `.env`:
```
PORT=3000
OSRM_URL=          # Defaults to https://router.project-osrm.org/route/v1/driving
```

## Path Aliases

`@/` maps to `src/`. Use `@/` imports throughout `src/`. The build uses `tsc-alias` to resolve these in the compiled output.

## Key Domain Concepts

- **Shipment** entity has statuses: `PENDING`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`
- Distance is fetched from OSRM; estimated delivery = `distanceKm / speed` (speed configured via env, default 80 km/h)
- City-to-coordinate mapping is hardcoded in `src/utils/map-helper.ts`
