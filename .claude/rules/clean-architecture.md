---
description: Clean architecture rules for the shipping API. Apply when adding features, endpoints, or restructuring code.
globs: ["src/**/*.ts"]
---

# Clean Architecture Rules

## Layer boundaries (violations are bugs, not style issues)

| Layer | Location | Allowed dependencies | Forbidden |
|-------|----------|---------------------|-----------|
| Routes | `src/routes/` | Controllers | Business logic, Zod, Prisma |
| Controllers | `src/controllers/` | Use cases, Zod DTOs | Prisma, domain logic |
| Use Cases | `src/usecases/` | Repository interfaces | Prisma, Express, HTTP concepts |
| Providers | `src/providers/` | External SDKs, fetch | Use cases, controllers |

## Dependency injection
- Use cases receive dependencies via constructor, typed as interfaces
- Controllers are the only place that instantiate use cases with concrete implementations
- Never `new OsrmMapProvider()` inside a use case

## Adding a new feature: mandatory order
1. DTO schema in `src/dtos/`
2. Use case in `src/usecases/` — pure logic, no HTTP
3. Controller handler in `src/controllers/`
4. Route registration in `src/routes/`
5. Unit tests in `tests/usecases/`

## What belongs where
- **Business rules** (state machines, calculations, validations) → Use Case
- **Request parsing, response shaping** → Controller
- **HTTP method + path definition** → Route
- **External API calls, DB queries** → Provider/Repository

## Import conventions
- Always use `@/` alias for imports within `src/`
- Never use relative `../../` paths
- Group imports: external packages → `@/` internal modules
