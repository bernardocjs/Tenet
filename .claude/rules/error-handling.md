---
description: Error handling rules for the shipping API. Apply to all src/ files.
globs: ["src/**/*.ts"]
---

# Error Handling Rules

## Error hierarchy
```
AppError (base — has statusCode, extends Error)
├── NotFoundError    (404) — entity not in DB
├── BadRequestError  (400) — invalid state, business rule violation
└── ExternalServiceError (503) — third-party failure (OSRM, etc.)
```
Location: `src/errors/`

## Rules

**Never throw generic `Error`** in use cases or providers. Always use an `AppError` subclass.

**Use case errors:**
```typescript
// Entity not found
const shipment = await this.db.findById(id)
if (!shipment) throw new NotFoundError(`Shipment ${id} not found`)

// Invalid state
if (!validTransitions[current].includes(next))
  throw new BadRequestError(`Cannot transition from ${current} to ${next}`)
```

**Provider errors:**
```typescript
// Wrap all external failures
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new ExternalServiceError('OSRM returned non-200')
} catch (err) {
  if (err instanceof AppError) throw err  // re-throw our errors
  throw new ExternalServiceError('OSRM service unavailable')
}
```

**Unknown city validation:** throw `BadRequestError` (client error — they sent an unsupported city name).

## What the error middleware does (don't duplicate this logic)
- `AppError` → `{ error: message }` with `statusCode`
- `ZodError` → `{ error: "Validation error", details: [...] }` with 400
- Unknown `Error` → logs full error, returns `{ error: "Internal server error" }` with 500

## Never
- Expose stack traces, Prisma internals, or raw error messages to clients
- Catch `ZodError` manually in controllers — middleware handles it
- Return a 500 for a client mistake (use 400 or 404)
- Swallow errors silently — always throw or log
