---
description: Production readiness requirements. Apply when reviewing code for deployment or adding new infrastructure concerns.
globs: ["src/**/*.ts", "docker-compose.yml", "prisma/**"]
---

# Production Readiness Rules

## Non-negotiable before first deploy

### 1. Graceful shutdown
```typescript
// src/server.ts — must exist
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down')
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
})
```

### 2. External service timeouts
```typescript
// All fetch calls must have a timeout
fetch(url, { signal: AbortSignal.timeout(5000) })
```

### 3. Dependency health check
The `/health` endpoint must verify actual dependencies:
```typescript
// Check DB + OSRM, not just return 200
GET /health → { status: "ok" | "degraded", db: "ok" | "error", osrm: "ok" | "error" }
```

### 4. Database migrations in deploy
Run `npx prisma migrate deploy` before `node dist/server.js` in every deployment.

## Environment variables
Every new env var must:
1. Be added to `src/config/index.ts` with a default or validation
2. Be documented in `.env.example` with a comment
3. Never be hardcoded anywhere in `src/`

## Logging in production
```typescript
// Always include structured context
logger.info({ shipmentId, origin, destination }, 'Shipment created')
logger.error({ err, shipmentId }, 'Failed to fetch route from OSRM')

// Never
console.log('something happened')
logger.info(`Shipment ${id} created`)  // unstructured
```

## Security baseline
- No secrets in logs (DATABASE_URL, API keys)
- No stack traces in HTTP error responses
- Request body size limit: configure `express.json({ limit: '10kb' })`

## Operational checklist (verify before deploy)
```
[ ] SIGTERM handler implemented
[ ] All fetch calls have AbortSignal.timeout
[ ] /health checks real dependencies
[ ] npm run lint — clean
[ ] npm test — all pass
[ ] npm run build — compiles
[ ] prisma migrate deploy — applied
[ ] LOG_LEVEL env var respected
[ ] .env.example up to date
```
