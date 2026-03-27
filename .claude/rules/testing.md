---
description: Testing rules and patterns for the shipping API. Apply when writing or modifying tests.
globs: ["tests/**/*.ts"]
---

# Testing Rules

## Framework
- Vitest + `vitest-mock-extended` for deep mocking
- Mirror `src/` structure in `tests/` (e.g., `src/usecases/foo.ts` → `tests/usecases/foo.test.ts`)
- Run single file: `npx vitest run tests/usecases/my-test.test.ts`

## Mocking strategy
```typescript
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Mock Prisma
const prismaMock = mockDeep<PrismaClient>()

// Mock interface
const mapMock = mockDeep<MapRepository>()

// Always reset in beforeEach — prevents cross-test pollution
beforeEach(() => mockReset(prismaMock))
```

## What must be tested

**Use cases** (100% branch coverage required):
- Happy path with correct output shape
- Every NotFoundError path (null from DB)
- Every BadRequestError path (invalid state transitions)
- That repository methods are called with correct arguments
- Return value matches expected shape

**Providers**:
- Success path with expected return value
- Every error path (network failure, bad API response, unknown city)
- That fetch is called with correct URL and params

## What NOT to test
- Express routing (integration concern)
- Zod schema shapes (Zod is already tested)
- Prisma internals (mock it)

## Coverage gate
Run `npm run test:coverage` before any PR. Target:
- Use cases: 100% branch coverage
- Providers: all error paths covered

## Test naming
```typescript
it('should throw NotFoundError when shipment does not exist')
it('should transition status from PENDING to IN_TRANSIT')
it('should throw BadRequestError when transitioning from DELIVERED')
```
Format: `should [outcome] when [condition]`
