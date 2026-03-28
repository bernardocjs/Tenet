---
name: review
description: Multi-perspective code review. Spawns backend (architecture/tests) and SRE (reliability/observability) agents in parallel against current git diff.
---

Review the current changes (or: $ARGUMENTS if a specific file/PR is mentioned).

## Process

**Step 1 — get the diff (minimal context)**
Run: `git diff HEAD` (or `git diff main...HEAD` if reviewing a branch)
Keep only the diff output — do not read full files unless an agent asks.

**Step 2 — spawn backend + SRE in parallel**

Spawn `backend` subagent:

> Review the following git diff for the shipping API from a backend/architecture perspective:
> [paste diff]
>
> Check for:
>
> - Clean architecture violations (wrong layer dependencies, business logic in wrong place)
> - Missing or weak test coverage for new code
> - TypeScript type safety issues (any types, missing return types)
> - Error handling gaps (unhandled error paths, generic Error throws)
> - Naming and code clarity
>
> Format: Critical | Recommended | Observations (one-liners with file:line references)

Spawn `sre` subagent (in same message, parallel):

> Review the following git diff for the shipping API from an SRE/reliability perspective:
> [paste diff]
>
> Check for:
>
> - Logging: is new code observable? are external calls logged with context?
> - Error resilience: external service failures handled? timeouts present?
> - Any new env vars documented in .env.example?
> - Production readiness concerns
>
> Format: Critical | Recommended | Observations

**Step 3 — synthesize**
Combine both agents' findings. Present as:

```
## Critical (must fix before merge)
...

## Recommended (should fix)
...

## Observations
...
```

Ask user if they want fixes applied automatically.
