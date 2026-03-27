---
name: prod-check
description: Full production readiness audit. Runs lint, tests, build, then spawns SRE + DevOps agents in parallel to audit reliability and deployment posture.
disable-model-invocation: true
---

Run a full production readiness check on the shipping API.

## Process

**Step 1 — automated checks (run sequentially)**
```bash
npm run lint
npm run test:coverage
npm run build
```
Capture results. If lint or tests fail, stop and report — fix those before continuing.

**Step 2 — read current state (brief, scoped)**
Read only these files to give agents accurate context:
- `src/server.ts` — startup and shutdown handling
- `src/providers/map/osrm-map-provider.ts` — external service resilience
- `src/routes/index.ts` — health endpoint
- `docker-compose.yml` — infrastructure config
- `.env.example` — env var documentation

**Step 3 — spawn SRE + DevOps in parallel**

Spawn `sre` subagent:
> Audit this shipping API for production readiness from an SRE perspective.
> Here are the relevant source files: [paste the files read above]
>
> Specifically check each item on this list and mark ✅ ⚠️ or ❌:
> - SIGTERM handler with Prisma disconnect
> - Fetch timeouts on all external calls
> - /health endpoint checks real dependencies
> - Structured logging with context (not string interpolation)
> - Request correlation ID
> - Error types correct (AppError subclasses, not generic Error)
>
> For each ❌ or ⚠️, provide the exact code fix needed.

Spawn `devops` subagent (same message, parallel):
> Audit this shipping API for deployment readiness from a DevOps perspective.
> Here are the relevant files: [paste docker-compose.yml and .env.example]
>
> Check and mark ✅ ⚠️ or ❌:
> - .env.example has all required vars with comments
> - Docker Compose provisions PostgreSQL correctly
> - Build compiles to dist/ without errors
> - Migration strategy for production (migrate deploy vs migrate dev)
> - No hardcoded secrets or localhost URLs in src/
>
> Provide the exact commands and files to fix any ❌ or ⚠️.

**Step 4 — final report**
Combine automated check results + both agents' findings into:

```
## Automated Checks
lint: ✅/❌  |  tests: ✅/❌ (coverage: X%)  |  build: ✅/❌

## SRE Audit
[checklist with status]

## DevOps Audit
[checklist with status]

## Deploy Decision
✅ Ready to deploy / ❌ X blockers must be fixed first
```
